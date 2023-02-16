import { PrismaClient, Race } from "@prisma/client";
import { NextApiHandler } from "next";

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

const addRaceResult: NextApiHandler = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(400).end();
  }

  const prisma = new PrismaClient();

  const data = req.body;
  if (!isRace(data)) {
    return res.status(500).send("cannot parse body");
  }

  const horse = await prisma.horse.findUniqueOrThrow({
    where: { id: data.horseId },
    include: { pogCategory: true },
  });

  try {
    await prisma.race.create({ data });
  } catch (error) {
    console.error(error);
    return res.status(500).send("cannot create record");
  }

  try {
    // TODO: 他のエンドポイントにも対応させる, カテゴリ名をパスと一致させる
    await res.revalidate(`/2022-2023/odds`);
    await res.revalidate(`/2022-2023/odds/${horse.ownerId}`);
    await res.revalidate(`/2022-2023/odds/${horse.ownerId}/${horse.id}`);
  } catch (error) {
    return res.status(500).send("cannot create deployment");
  }
  return res.json({ revalidated: true });
};

export default addRaceResult;
