import { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "graphqurl";

const getStakersAPI = (req: NextApiRequest, res: NextApiResponse) => {
  const { apiKey, address } = req.query;

  if (apiKey === process.env.API_KEY) {
    const client = createClient({
      endpoint: process.env.API_URI,
    });

    const variables: any = {
      where: {
        status: {
          _in: ["restaking", "staking"],
        },
      },
    };

    if (address?.length > 0) {
      variables.where = {
        _and: [{ ...variables.where }, { wallet: { _eq: address } }],
      };
    }

    return client
      .query({
        query: `
          query getActiveStakes($where: missions_bool_exp) {
            missions(where: $where) {
              mints
              wallet
              status
            }
          }
        `,
        variables,
      })
      .then(async ({ data }) => {
        const addresses = {};
        for (const mission of data.missions) {
          if (addresses?.[mission.wallet]) {
            addresses?.[mission.wallet].push(
              ...mission.mints.map((m) => m.mint)
            );
          } else {
            addresses[mission.wallet] = [...mission.mints.map((m) => m.mint)];
          }
        }
        return res.json(addresses);
      })
      .catch((err) => {
        return res.json({ ok: false, err: err.message });
      });
  } else {
    return res.json({ error: true, message: "API Key is not valid" });
  }
};

export default getStakersAPI;
