// getOrCreateAssociatedTokenAccount.ts
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { SignerWalletAdapterProps } from "@solana/wallet-adapter-base";
import {
  Connection,
  PublicKey,
  Commitment,
  Transaction,
} from "@solana/web3.js";
import { createAssociatedTokenAccountInstruction } from "./createAssociatedTokenAccountInstruction";
import { getAccountInfo } from "./getAccountInfo";
import { getAssociatedTokenAddress } from "./getAssociatedTokerAddress";

export async function getOrCreateAssociatedTokenAccount(
  connection: Connection,
  payer: PublicKey,
  mints: string[],
  owner: PublicKey,
  signTransaction: SignerWalletAdapterProps["signTransaction"],
  allowOwnerOffCurve = false,
  commitment?: Commitment,
  programId = TOKEN_PROGRAM_ID,
  associatedTokenProgramId = ASSOCIATED_TOKEN_PROGRAM_ID
) {
  const accounts: any = {};

  const transaction = new Transaction();
  const ins = [];

  for await (const _m of mints) {
    const mint = new PublicKey(_m);
    let account;
    const associatedToken = await getAssociatedTokenAddress(
      mint,
      owner,
      allowOwnerOffCurve,
      programId,
      associatedTokenProgramId
    );

    // This is the optimal logic, considering TX fee, client-side computation, RPC roundtrips and guaranteed idempotent.
    // Sadly we can't do this atomically.
    try {
      account = await getAccountInfo(
        connection,
        associatedToken,
        commitment,
        programId
      );
      accounts[_m] = account;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      // TokenAccountNotFoundError can be possible if the associated address has already received some lamports,
      // becoming a system account. Assuming program derived addressing is safe, this is the only case for the
      // TokenInvalidAccountOwnerError in this code path.
      if (
        error.message === "TokenAccountNotFoundError" ||
        error.message === "TokenInvalidAccountOwnerError"
      ) {
        // As this isn't atomic, it's possible others can create associated accounts meanwhile.
        transaction.add(
          createAssociatedTokenAccountInstruction(
            payer,
            associatedToken,
            owner,
            mint,
            programId,
            associatedTokenProgramId
          )
        );
        ins.push(
          createAssociatedTokenAccountInstruction(
            payer,
            associatedToken,
            owner,
            mint,
            programId,
            associatedTokenProgramId
          )
        );
      } else {
        throw error;
      }
    }
  }

  if (ins.length > 0) {
    const blockHash = await connection.getRecentBlockhash();
    transaction.feePayer = await payer;
    transaction.recentBlockhash = await blockHash.blockhash;
    const signed = await signTransaction(transaction);

    const signature = await connection.sendRawTransaction(signed.serialize());

    await connection.confirmTransaction(signature);
  }

  for await (const _m of mints) {
    const mint = new PublicKey(_m);

    if (!accounts?.[_m]) {
      let account: any;
      const associatedToken = await getAssociatedTokenAddress(
        mint,
        owner,
        allowOwnerOffCurve,
        programId,
        associatedTokenProgramId
      );
      // Now this should always succeed
      account = await getAccountInfo(
        connection,
        associatedToken,
        commitment,
        programId
      );

      if (!account.mint.equals(mint.toBuffer()))
        throw Error("TokenInvalidMintError");
      if (!account.owner.equals(owner.toBuffer()))
        throw new Error("TokenInvalidOwnerError");

      accounts[_m] = account;
    }
  }

  return accounts;
}
