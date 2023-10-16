export const IS_PROD = process.env.NODE_ENV === "production";
// In production the API is at the same URL, in development it's at a different port
export const API_URI = IS_PROD
  ? "https://omens-staking.herokuapp.com/v1/graphql"
  : "http://localhost:8080/v1/graphql";

export const BASE_URL = IS_PROD
  ? "https://dig.omens.art"
  : "http://localhost:3000";

export const BASE_APIURL = `${BASE_URL}/api`;

export const WS_URI = IS_PROD
  ? `wss://omens-staking.herokuapp.com/v1/graphql`
  : "ws://localhost:8080/v1/graphql";

export const STAKING_WALLET = "STYXaJSvjUuqex1fTretVdapaSSA8vhZsxsvitsf3rj";

export const MISSION_KEY = {
  normal: {
    requirements: () => true,
    reward: 8,
    earningCycle: 24,
    cancelPenalty: 0,
    name: "Island of Aeaea",
    lossText: null,
    drops: null,
    cost: 0,
  },
  locked3: {
    requirements: () => true,
    reward: 0,
    earningCycle: 3 * 24,
    cancelPenalty: 0,
    name: "Palace of Midas",
    lossText: null,
    cost: 100,
    drops: [
      {
        chance: 0.002,
        type: "nft_5_sol",
      },
      {
        chance: 0.008,
        type: "nft_1_sol",
      },
      {
        chance: 0.05,
        type: "wl",
      },
      {
        chance: 0.1,
        type: "chalice_of_midas",
      },
      {
        chance: 0.06,
        type: "artifact_traits",
      },
      {
        chance: 0.09,
        type: "200_styx",
      },
      {
        chance: 0.08,
        type: "150_styx",
      },
      {
        chance: 0.11,
        type: "100_styx",
      },
      {
        chance: 0.2,
        type: "50_styx",
      },
      {
        chance: 0.3,
        type: "nothing",
      },
    ],
  },
  locked7: {
    name: "Atlantis",
    requirements: () => true,
    reward: 84,
    earningCycle: 7 * 24,
    cancelPenalty: 0.66,
    lossText: "66% Loss of Token Gain on early unstake",
    drops: null,
    cost: 0,
  },
  locked15: {
    name: "The Underworld",
    requirements: () => true,
    reward: 0,
    earningCycle: 15 * 24,
    cost: 300,
    cancelPenalty: 0,
    lossText: null,
    drops: [
      {
        chance: 0.007,
        type: "nft_5_sol",
      },
      {
        chance: 0.033,
        type: "nft_1_sol",
      },
      {
        chance: 0.1,
        type: "wl",
      },
      {
        chance: 0.1,
        type: "lyre_of_orpheus",
      },
      {
        chance: 0.1,
        type: "artifact_traits",
      },
      {
        chance: 0.12,
        type: "600_styx",
      },
      {
        chance: 0.33,
        type: "500_styx",
      },
      {
        chance: 0.21,
        type: "400_styx",
      },
    ],
  },
};
