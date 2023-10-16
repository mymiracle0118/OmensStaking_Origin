import React, { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { NavBar } from "../components/nav";
import { IMission } from "../components/staking/missions";
import { StakingTable } from "../components/staking/table";
import { withApollo } from "../utils/with-apollo";
import { useQuery, useSubscription } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { StakingStats } from "../components/staking/stats";
import { ConnectButton } from "../components/connect";
import useWalletNfts from "../hooks/use-wallet-nfts";
import classNames from "classnames";
import { useDigsite } from "../hooks/use-current-digsite";

const StakePage = () => {
  const wallet = useWallet();
  const [isLoading, nfts, getNFTs] = useWalletNfts();
  const [isViewingCurrent, setIsViewingCurrent] = useState<boolean>(true);
  const [isShowingStats, setIsShowingStats] = useState<boolean>(false);
  const [isShowingOwnStats, setIsShowingOwnStats] = useState<boolean>(false);
  const [isShowingAllTime, setIsShowingAllTime] = useState<boolean>(false);
  const { currentDigsite, setCurrentDigsite } = useDigsite();
  const { data, loading } = useSubscription(
    gql`
      subscription getMissionsQuery($where: missions_bool_exp) {
        missions(where: $where) {
          id
          reward
          wallet
          started_at
          extract_at
          mints
          transactions
          status
          type
        }
      }
    `,
    {
      variables: {
        where: {
          wallet: {
            _eq: wallet?.publicKey?.toString() || "0000",
          },
        },
      },
    }
  );

  const statusNWalletVariables = () => {
    const variables: any = [];

    if (isShowingOwnStats && wallet.connected) {
      variables.push({
        wallet: {
          _eq: wallet?.publicKey?.toString(),
        },
      });
    }

    if (!isShowingAllTime) {
      variables.push({
        _or: [{ status: { _eq: "staking" } }, { status: { _eq: "restaking" } }],
      });
    }

    return variables;
  };

  const searchVariables = statusNWalletVariables();
  const {
    data: statsData,
    loading: statsLoading,
    refetch: refetchStats,
  } = useQuery(
    gql`
      query statusQuery(
        $countWhere: missions_bool_exp
        $aeaeaWhere: missions_bool_exp
        $atlantisWhere: missions_bool_exp
        $midasWhere: missions_bool_exp
        $underworldWhere: missions_bool_exp
      ) {
        countNRewards: missions_aggregate(where: $countWhere) {
          aggregate {
            count
            sum {
              reward
            }
          }
        }
        aeaea: missions_aggregate(where: $aeaeaWhere) {
          aggregate {
            count
          }
        }
        atlantis: missions_aggregate(where: $atlantisWhere) {
          aggregate {
            count
          }
        }
        midas: missions_aggregate(where: $midasWhere) {
          aggregate {
            count
          }
        }
        underworld: missions_aggregate(where: $underworldWhere) {
          aggregate {
            count
          }
        }
      }
    `,
    {
      variables: {
        countWhere: {
          _and: searchVariables,
        },
        aeaeaWhere: {
          _and: [{ type: { _eq: "normal" } }, ...searchVariables],
        },
        midasWhere: {
          _and: [{ type: { _eq: "locked3" } }, ...searchVariables],
        },
        atlantisWhere: {
          _and: [{ type: { _eq: "locked7" } }, ...searchVariables],
        },
        underworldWhere: {
          _and: [{ type: { _eq: "locked15" } }, ...searchVariables],
        },
      },
    }
  );

  useEffect(() => {
    const interval = setInterval(() => {
      refetchStats();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const missions = data?.missions;

  return (
    <div
      className={classNames(
        "w-full h-full",
        currentDigsite ? `bg-${currentDigsite}` : "bg-base"
      )}
    >
      {/* Nav Bar */}
      <NavBar />
      {/* Header */}
      <div
        className={"w-full h-screen flex justify-around items-center"}
        style={{
          ...(currentDigsite && { background: `url(/${currentDigsite}.png)` }),
        }}
      >
        <div
          className={
            "w-full absolute overflow-auto z-10 flex flex-col h-full flex-1 pt-16 px-10 lg:px-20"
          }
        >
          {!!currentDigsite && (
            <div className="flex justify-end items-center mb-4">
              <a
                onClick={() => {
                  setIsShowingStats(!isShowingStats);
                  if (!isShowingStats) {
                    setIsShowingOwnStats(false);
                    setIsShowingAllTime(false);
                  }
                }}
                className={`font-viet uppercase tracking-spaced text-${currentDigsite}OffsetAccent cursor-pointer px-4 py-2 mx-2 text-center text-lg border-${currentDigsite}OffsetAccent border-special-sm rounded-lg`}
                style={{ background: "rgba(0, 0, 0, .6)" }}
              >
                <span>{!isShowingStats ? "View Stats" : "Close Stats"}</span>
              </a>
              {wallet.connected && (
                <a
                  onClick={() => {
                    setIsViewingCurrent(!isViewingCurrent);
                  }}
                  className={`font-viet uppercase tracking-spaced text-${currentDigsite}OffsetAccent cursor-pointer px-4 py-2 mx-2 text-center text-lg border-${currentDigsite}OffsetAccent border-special-sm rounded-lg`}
                  style={{ background: "rgba(0, 0, 0, .6)" }}
                >
                  <span>
                    {isViewingCurrent ? "View Previous" : "View Current"}
                  </span>
                </a>
              )}
            </div>
          )}

          {!!currentDigsite && !statsLoading && isShowingStats && (
            <div className="flex flex-col items-center justify-center w-full">
              <StakingStats
                stats={statsData}
                isViewingAllTimeStats={isShowingAllTime}
                setIsViewingAllTimeStats={setIsShowingAllTime}
                isViewingMyStats={isShowingOwnStats}
                setIsViewingMyStats={setIsShowingOwnStats}
              />
            </div>
          )}

          {!currentDigsite && wallet.connected ? (
            <div className={"flex items-center justify-center w-full -mt-12"}>
              <div className="w-full lg:w-2/3 flex flex-col lg:flex-row flex-wrap">
                <a
                  className={
                    "w-1/2 h-80 flex items-center justify-center rounded-2xl lg:rounded-tl-2xl relative lg:rounded-b-none lg:rounded-tr-none group cursor-pointer overflow-hidden"
                  }
                  onClick={() => setCurrentDigsite("aeaea")}
                >
                  <img
                    src={"/aeaea.png"}
                    className={"w-full h-full absolute"}
                  />
                  <div className="group-hover:opacity-100 opacity-0 flex justify-center items-center bg-black w-full h-full bg-opacity-70 absolute transition-all">
                    <p
                      className={
                        "font-bebas text-6xl text-primary tracking-spaced"
                      }
                    >
                      AEAEA
                    </p>
                  </div>
                </a>
                <a
                  className={
                    "w-1/2 h-80 flex items-center justify-center rounded-2xl lg:rounded-tr-2xl relative lg:rounded-b-none lg:rounded-tl-none group cursor-pointer overflow-hidden"
                  }
                  onClick={() => setCurrentDigsite("atlantis")}
                >
                  <img
                    src={"/atlantis.png"}
                    className={"w-full h-full absolute"}
                  />
                  <div className="group-hover:opacity-100 opacity-0 flex justify-center items-center bg-black w-full h-full bg-opacity-70 absolute transition-all">
                    <p
                      className={
                        "font-bebas text-6xl text-primary tracking-spaced"
                      }
                    >
                      ATLANTIS
                    </p>
                  </div>
                </a>
                <a
                  className={
                    "w-1/2 h-80 flex items-center justify-center rounded-2xl relative lg:rounded-bl-2xl lg:rounded-t-none lg:rounded-br-none group cursor-pointer overflow-hidden"
                  }
                  onClick={() => setCurrentDigsite("midas")}
                >
                  <img
                    src={"/midas.png"}
                    className={"w-full h-full absolute"}
                  />
                  <div className="group-hover:opacity-100 opacity-0 flex justify-center items-center bg-black w-full h-full bg-opacity-70 absolute transition-all">
                    <p
                      className={
                        "font-bebas text-6xl text-primary tracking-spaced"
                      }
                    >
                      MIDAS
                    </p>
                  </div>
                </a>
                <a
                  className={
                    "w-1/2 h-80 flex items-center justify-center rounded-2xl relative lg:rounded-br-2xl lg:rounded-t-none lg:rounded-bl-none group cursor-pointer overflow-hidden"
                  }
                  onClick={() => setCurrentDigsite("underworld")}
                >
                  <img
                    src={"/underworld.png"}
                    className={"w-full h-full absolute"}
                  />
                  <div className="group-hover:opacity-100 opacity-0 flex justify-center items-center bg-black w-full h-full bg-opacity-70 absolute transition-all">
                    <p
                      className={
                        "font-bebas text-6xl text-primary tracking-spaced"
                      }
                    >
                      UNDERWORLD
                    </p>
                  </div>
                </a>
              </div>
            </div>
          ) : (
            wallet.connected &&
            !loading && (
              <StakingTable
                missions={
                  missions?.filter(
                    (m: IMission) =>
                      m.status ===
                        (isViewingCurrent ? "staking" : "completed") ||
                      m.status ===
                        (isViewingCurrent ? "pending" : "canceled") ||
                      (isViewingCurrent && m.status === "cancel-pending") ||
                      (isViewingCurrent && m.status === "pending-complete") ||
                      (isViewingCurrent && m.status === "restaking")
                  ) || []
                }
                usersActiveMints={missions.flatMap((m) =>
                  m.status === "pending" ||
                  m.status === "staking" ||
                  m.status === "pending-complete" ||
                  m.status === "cancel-pending" ||
                  m.status === "restaking" ||
                  m.status === "cancel-verify"
                    ? m.mints.map((_m) => _m.mint)
                    : []
                )}
              />
            )
          )}
          <div
            className={classNames(
              wallet.connected
                ? "absolute z-0 -top-96"
                : "w-full flex-col flex items-center justify-center mt-12"
            )}
          >
            <p
              className={
                "text-3xl font-bebas text-primary tracking-spaced text-center my-4"
              }
            >
              Connect your wallet to stake
            </p>
            <ConnectButton />
          </div>
        </div>
      </div>
    </div>
  );
};

export default withApollo()(StakePage);
