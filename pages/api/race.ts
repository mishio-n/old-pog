import { Race } from "@prisma/client";
import { NextApiHandler } from "next";

const isRace = (data: any): data is Omit<Race, "id"> => {
  if (typeof data.race !== "string" || data.race !== "") {
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
  if (typeof data.date !== "object") {
    return false;
  }

  return true;
};

const addRaceResult: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).end();
  }

  const data = JSON.parse(req.body);
  if (!isRace(data)) {
    return res.status(500).end("cannot parse body");
  }

  try {
    await prisma.race.create({ data });
  } catch (error) {
    return res.status(500).send("cannot create record");
  }

  try {
    await fetch(process.env.DEPLOY_URL || "", { method: "POST" });
  } catch (error) {
    return res.status(500).send("cannot create deployment");
  }
  return res.status(200);
};

export default addRaceResult;
