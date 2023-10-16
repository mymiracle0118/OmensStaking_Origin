import { TOKEN_PROGRAM_ID } from "@solana/spl-token";

export const getTokenHolder = (mint) => {
  return fetch(process.env.NEXT_PUBLIC_SOLANA_RPC_HOST, {
    body: `{
          "jsonrpc":"2.0", 
          "id":1, 
          "method":"getProgramAccounts", 
          "params":[
            "${TOKEN_PROGRAM_ID}",
            {
              "encoding": "jsonParsed",
              "filters": [
                {
                  "dataSize": 165
                },
                {
                  "memcmp": {
                    "offset": 0,
                    "bytes": "${mint}"
                  }
                }
              ]
            }
          ]}
      `,
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
    .then((res) => res.json())
    .then((res) => {
      return (
        res.result
          .filter((r) => r.account.data.parsed.info.tokenAmount.uiAmount > 0)
          .map((r) => r.account.data.parsed.info.owner)?.[0] || null
      );
    });
};
