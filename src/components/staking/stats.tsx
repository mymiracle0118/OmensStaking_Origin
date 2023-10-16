import React from "react";

export const StakingStats = (props: {
  stats: any;
  isViewingMyStats?: boolean;
  setIsViewingMyStats?: any;
  isViewingAllTimeStats?: boolean;
  setIsViewingAllTimeStats?: any;
}) => {
  const {
    isViewingMyStats,
    setIsViewingMyStats,
    isViewingAllTimeStats,
    setIsViewingAllTimeStats,
    stats: { countNRewards },
  } = props;

  return (
    <div
      className={
        "flex flex-col justify-around w-full lg:w-1/2 mb-4 border-primary border shadow-box rounded-2.5xl border-special bg-black bg-opacity-60 p-4"
      }
    >
      <div
        className={
          "flex flex-col lg:flex-row justify-between p-2 border-primary mx-2 border-b-0 lg:border-b font-viet uppercase tracking-spaced text-primary"
        }
      >
        <p>Stats are updated every 30 seconds</p>
        <div className="flex flex-col lg:flex-row">
          <a
            className="p-1 border border-primary px-2 mx-1 lg:my-0 my-2 cursor-pointer text-center"
            onClick={() => {
              setIsViewingMyStats(!isViewingMyStats);
            }}
          >
            {isViewingMyStats ? `View Total Stats` : `View My Stats`}
          </a>
          <a
            className="p-1 border border-primary px-2 mx-1 lg:my-0 my-2 cursor-pointer text-center"
            onClick={() => {
              setIsViewingAllTimeStats(!isViewingAllTimeStats);
            }}
          >
            {isViewingAllTimeStats
              ? `View Current Stats`
              : `View All Time Stats`}
          </a>
        </div>
      </div>
      <div
        className={
          "flex flex-row justify-between p-2 border-primary mx-2 border-b font-viet uppercase tracking-spaced text-primary"
        }
      >
        <p>Active Digs</p>
        <p>{countNRewards.aggregate.count}</p>
      </div>
      <div
        className={
          "flex flex-row justify-between p-2 border-primary mx-2 font-viet uppercase tracking-spaced text-primary"
        }
      >
        <p>{isViewingAllTimeStats ? "Earned" : "Possible"} $STYX</p>
        <p>{countNRewards.aggregate.sum.reward} $STYX</p>
      </div>
    </div>
  );
};
