import { type Owner } from ".prisma/client";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import { groupBy } from "../../../lib/group-by";
import { prisma } from "../../../lib/prisma";
import { aggregateRacePoint } from "../../../lib/race-point";

type Props = {
  ownerWithPoints: (Owner & { totalPoint: number })[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const owners = await prisma.owner.findMany();
  const horses = await prisma.horse.findMany({ include: { race: true } });
  const horsesByOwner = groupBy(horses, (h) => h.ownerId);
  const ownerWithPoints = owners.map(({ id, name }) => ({
    id,
    name,
    totalPoint: horsesByOwner[id].reduce(
      (result, horse) => result + aggregateRacePoint(horse.race).totalPoint,
      0
    ),
  }));

  // ポイント順にして返却する
  ownerWithPoints.sort((a, b) => b.totalPoint - a.totalPoint);

  return {
    props: {
      ownerWithPoints,
    },
  };
};

const Odds2022_2023: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ ownerWithPoints }) => {
  return (
    <>
      <Head>
        <title>オッズ傾斜POG | おうちPOG</title>
        <meta name="description" content="POG" />
      </Head>
      <div className="artboard p-5">
        <div className="text-sm breadcrumbs">
          <ul>
            <li>
              <Link href={"/"}>
                <a>TOP</a>
              </Link>
            </li>
            <li>
              <Link href={"/2022-2023"}>
                <a>2022-2023</a>
              </Link>
            </li>
            <li>オッズ傾斜POG</li>
          </ul>
        </div>
        <div className="artboard p-5">
          {ownerWithPoints.map((owner) => (
            <div className="flex" key={owner.id}>
              <Link href={`/2022-2023/odds/${owner.id}`}>
                <a>
                  <span>{owner.name}</span>
                  <span>{owner.totalPoint}</span>
                </a>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Odds2022_2023;
