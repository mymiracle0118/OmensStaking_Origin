import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { fancyTimeFormat } from "../../utils";
import utc from "dayjs/plugin/utc";
import { useMutation, useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { MISSION_KEY } from "../../utils/constants";
import { Button, FilledButton } from "../button";
import { useDigsite } from "../../hooks/use-current-digsite";

dayjs.extend(utc);

export interface IMint {
  image: string;
  animation_url: string;
  symbol: string;
  collection: {
    family: string;
    name: string;
  };
  external_url: string;
  name: string;
  attributes: {
    value: string | number | any;
    trait_type: string;
  }[];
  seller_fee_basis_points: string;
  mint: string;
  description: string;
  properties: {
    creators: {
      share: number;
      address: string;
    }[];
    files: {
      uri: string;
      type: string;
    }[];
  };
}

export interface IMission {
  id: string;
  mints: IMint[];
  reward?: number;
  type?: string;
  extract_at?: string;
  started_at?: string;
  wallet?: string;
  status?: string;
  is_example?: boolean;
  transactions?: { tx: string; tx_info: string }[];
}

export const MissionEntry = (props: { mission: IMission }) => {
  const {
    mission: {
      id,
      mints,
      reward,
      type,
      started_at,
      extract_at,
      is_example,
      status,
      transactions,
    },
  } = props;
  const [showAreYouSure, setShowAreYouSure] = useState<boolean>(false);
  const [updateMission] = useMutation(gql`
    mutation updateMission(
      $where: missions_bool_exp!
      $_set: missions_set_input
    ) {
      update_missions(where: $where, _set: $_set) {
        returning {
          id
        }
      }
    }
  `);
  const { data: mintData, loading } = useQuery(
    gql`
      query getMintsFromDBForUpdate($where: items_bool_exp) {
        items(where: $where) {
          mint
          metadata
        }
      }
    `,
    {
      variables: {
        where: {
          mint: {
            _in: mints.map((m) => m.mint),
          },
        },
      },
    }
  );

  const [extract, setExtract] = useState<string>("00:00:00");
  const [currentEarned, setCurrentEarned] = useState<number>(0.0);
  const sortedTokens = mintData?.items?.map((i) => i.metadata) || mints;
  const { currentDigsite } = useDigsite();

  useEffect(() => {
    if (!is_example) {
      const timeout = setInterval(() => {
        const timeTill = dayjs.utc(extract_at).diff(dayjs(), "s");
        const timeSince = Math.abs(dayjs.utc(started_at).diff(dayjs(), "s"));
        if (timeTill > 0) {
          const perSecond = reward / (MISSION_KEY[type].earningCycle * 3600);
          setCurrentEarned(timeSince * perSecond);
          setExtract(fancyTimeFormat(timeTill));
        } else {
          setCurrentEarned(reward);
          clearInterval(timeout);
        }
      }, 1000);

      return () => clearInterval(timeout);
    } else {
      setExtract(fancyTimeFormat(dayjs.utc(extract_at).diff(dayjs(), "s")));
    }
  }, [props]);

  return (
    <div
      className={`w-full mb-4 bg-black bg-opacity-50 pl-8 py-2.5 px-4 rounded-lg border-${currentDigsite}OffsetAccent border-special-sm flex flex-col`}
    >
      {showAreYouSure && (
        <div className="fixed w-full h-full overflow-hidden bg-secondary bg-opacity-80 top-0 left-0 right-0 bottom-0 z-50 flex flex-col items-center justify-center">
          <p
            className={`font-bebas tracking-spaced text-5xl underline text-${currentDigsite}OffsetAccent`}
          >
            ARE YOU SURE YOU WANT TO CANCEL THIS DIG?
          </p>
          <p
            className={`font-viet uppercase tracking-spaced text-${currentDigsite}OffsetAccent`}
          >
            Please note canceling this dig is irreversible and you can lose a
            significant amount of STYX. Are you sure you want to continue?
          </p>
          <div className="flex my-4">
            <a
              onClick={() => {
                updateMission({
                  variables: {
                    where: {
                      id: {
                        _eq: id,
                      },
                    },
                    _set: {
                      status: "cancel-pending",
                    },
                  },
                }).then(() => {
                  setShowAreYouSure(false);
                });
              }}
              className={`font-viet uppercase tracking-spaced text-${currentDigsite}OffsetAccent cursor-pointer px-4 py-2 mx-2 text-center text-lg border-${currentDigsite}OffsetAccent border-special-sm rounded-2.5xl`}
              style={{ background: "rgba(0, 0, 0, .6)" }}
            >
              <span>Yes, Cancel Dig</span>
            </a>

            <a
              onClick={() => setShowAreYouSure(!showAreYouSure)}
              className={`font-viet uppercase tracking-spaced text-${currentDigsite}OffsetAccent cursor-pointer px-4 py-2 mx-2 text-center text-lg border-${currentDigsite}OffsetAccent border-special-sm rounded-2.5xl`}
              style={{ background: "rgba(0, 0, 0, .6)" }}
            >
              <span>No! Don't Cancel Dig</span>
            </a>
          </div>
        </div>
      )}
      <div className="flex flex-col lg:items-center lg:flex-row">
        <div className={"flex flex-row flex-1"}>
          {sortedTokens.length > 0 ? (
            sortedTokens.map((token, index) => {
              return (
                <div className={"flex flex-row mr-2"}>
                  <img
                    src={token.image}
                    className={`w-12 h-12 border-${currentDigsite}OffsetAccent rounded-md border-special-sm`}
                  />
                  <div className={"flex flex-col justify-center mx-2"}>
                    <p
                      className={`text-${currentDigsite}OffsetAccent font-viet uppercase tracking-spaced`}
                    >
                      {token.name}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <img
              src={"/loader.png"}
              className={`w-12 h-12 border-${currentDigsite}OffsetAccent rounded-md border-special-sm`}
            />
          )}
        </div>
        <div className="flex flex-row lg:mt-0 mt-4">
          <p
            className={`font-viet uppercase tracking-spaced text-md border-r text-${currentDigsite}OffsetAccent border-${currentDigsite}OffsetAccent px-2`}
          >
            {status === "completed" ||
            status === "canceled" ||
            status === "pending-complete"
              ? `${reward} $STYX`
              : reward === 0
              ? "Drops"
              : `${currentEarned.toFixed(3)}/${reward} $STYX`}
          </p>
          <p
            className={`font-viet uppercase tracking-spaced text-md border-r text-${currentDigsite}OffsetAccent uppercase border-${currentDigsite}OffsetAccent px-2`}
          >
            {MISSION_KEY[type].name}
          </p>
          {MISSION_KEY[type].lossText && (
            <p
              className={`font-viet uppercase tracking-spaced text-md border-r text-${currentDigsite}OffsetAccent uppercase border-${currentDigsite}OffsetAccent px-2`}
            >
              {MISSION_KEY[type].lossText}
            </p>
          )}
          <a
            className={`font-viet uppercase tracking-spaced text-md text-${currentDigsite}OffsetAccent border-${currentDigsite}OffsetAccent px-2 cursor-pointer`}
            onClick={() => {
              if (status === "completed" || status === "pending-complete") {
                window?.open(
                  `https://solscan.io/tx/${
                    transactions.filter(
                      (tx) =>
                        tx.tx_info === "Staking Complete" && tx.tx !== "invalid"
                    )?.[0]?.tx
                  }`
                );
              }

              if (status === "canceled") {
                window?.open(
                  `https://solscan.io/tx/${
                    transactions.filter(
                      (tx) =>
                        tx.tx_info === "Staking Canceled" && tx.tx !== "invalid"
                    )?.[0]?.tx
                  }`
                );
              }

              if (
                status === "pending" ||
                status === "staking" ||
                status === "restaking"
              ) {
                window?.open(
                  `https://solscan.io/tx/${
                    transactions.filter(
                      (tx) => tx.tx_info === "Staking Started"
                    )?.[0]?.tx
                  }`
                );
              }
            }}
          >
            {status === "completed"
              ? "Complete *"
              : status === "pending"
              ? "Pending Confirmations *"
              : status === "canceled"
              ? "Canceled *"
              : status === "cancel-pending" || status === "cancel-verify"
              ? "Pending Cancelation"
              : status === "pending-complete"
              ? `Pending Completion *`
              : `${extract} *`}
          </a>
          {(status === "staking" || status === "restaking") && (
            <>
              {status === "restaking" ? (
                <a
                  className={`font-viet uppercase tracking-spaced text-md text-${currentDigsite}OffsetAccent border-l border-${currentDigsite}OffsetAccent px-2 cursor-pointer`}
                  onClick={() => {
                    updateMission({
                      variables: {
                        where: {
                          id: {
                            _eq: id,
                          },
                        },
                        _set: {
                          status: "staking",
                        },
                      },
                    });
                  }}
                >
                  Stop Auto Dig
                </a>
              ) : (
                <a
                  className={`font-viet uppercase tracking-spaced text-md text-${currentDigsite}OffsetAccent border-l border-${currentDigsite}OffsetAccent px-2 cursor-pointer`}
                  onClick={() => {
                    updateMission({
                      variables: {
                        where: {
                          id: {
                            _eq: id,
                          },
                        },
                        _set: {
                          status: "restaking",
                        },
                      },
                    });
                  }}
                >
                  Auto Dig
                </a>
              )}
              <a
                className={`font-viet uppercase tracking-spaced text-md text-${currentDigsite}OffsetAccent border-l border-${currentDigsite}OffsetAccent px-2 cursor-pointer`}
                onClick={() => {
                  setShowAreYouSure(!showAreYouSure);
                }}
              >
                Cancel Dig
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
