import { PrismaClient, Race } from "@prisma/client";
import { NextApiHandler } from "next";

type VERCEL_DEPLOY_STATUS =
  | "BUILDING"
  | "ERROR"
  | "INITIALIZING"
  | "QUEUED"
  | "READY"
  | "CANCELED";

//https://vercel.com/docs/rest-api#endpoints/deployments/list-deployments
type VERCEL_DEPLOYMENT = {
  deployments: {
    state: VERCEL_DEPLOY_STATUS;
  }[];
};

const isRace = (data: any): data is Omit<Race, "id"> => {
  if (typeof data.race !== "string" || data.race === "") {
    return false;
  }
  if (typeof data.odds !== "number") {
    return false;
  }
  if (typeof data.point !== "number") {
    return false;
  }
  if (typeof data.result !== "number" || data.result < 0 || data.result > 18) {
    return false;
  }
  if (typeof data.horseId !== "number") {
    return false;
  }
  if (typeof data.date !== "string") {
    return false;
  }

  return true;
};

// const isDeployRunning = async () => {
//   const url = "https://api.vercel.com/v6/deployments?limit=1";
//   const res = await fetch(url, {
//     method: "GET",
//     headers: { Authorization: `Bearer ${process.env.API_TOKEN}` },
//   });

//   const deployment = (await res.json()) as VERCEL_DEPLOYMENT;
//   return deployment.deployments[0].state === "BUILDING";
// };

const addRaceResult: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).end();
  }

  const prisma = new PrismaClient();

  const data = req.body;
  if (!isRace(data)) {
    return res.status(500).send("cannot parse body");
  }

  try {
    await prisma.race.create({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).send("cannot create record");
  }

  // try {
  //   if (await isDeployRunning()) {
  //     return res.status(202).end();
  //   }
  // } catch (error) {
  //   console.log(error);
  // }

  try {
    console.log(process.env.DEPLOY_URL);
    await fetch(process.env.DEPLOY_URL || "", { method: "POST" });
  } catch (error) {
    return res.status(500).send("cannot create deployment");
  }
  return res.status(201).end();
};

export default addRaceResult;
