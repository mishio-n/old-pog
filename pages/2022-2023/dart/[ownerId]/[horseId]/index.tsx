import { type Horse, type Owner, type Race } from ".prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { RaceItem } from "~/components/RaceItem";
import { Stable } from "~/components/Stable";
import { prisma } from "~/lib/prisma";
import { aggregateRacePoint } from "~/lib/race-point";

type Props = {
  owner: Owner;
  horseWithRacePoint: Horse & {
    race: (Omit<Race, "date"> & { date: string })[];
  } & ReturnType<typeof aggregateRacePoint>;
  raceResults: {
    first: number;
    second: number;
    third: number;
    other: number;
  };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const owners = await prisma.owner.findMany();
  const horses = await prisma.horse.findMany({
    where: { pogCategoryId: 2 },
  });
  const paths = owners
    .map((owner) =>
      horses
        .filter(({ ownerId }) => ownerId === owner.id)
        .map((horse) => `/2022-2023/dart/${owner.id}/${horse.id}`)
    )
    .flat();

  return {
    paths,
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const ownerId = params?.ownerId;
  if (ownerId === undefined || typeof ownerId !== "string") {
    throw new Error("Bad request");
  }
  const horseId = params?.horseId;
  if (horseId === undefined || typeof horseId !== "string") {
    throw new Error("Bad request");
  }

  const owner = await prisma.owner.findUnique({
    where: { id: +ownerId },
  });

  if (owner === null) {
    throw new Error("Not found");
  }

  const horse = await prisma.horse.findUnique({
    where: { id: +horseId },
    // 表示用に最新の結果から並べておく
    include: { race: { orderBy: { date: "desc" } } },
  });

  if (horse === null) {
    throw new Error("Not found");
  }

  const horseWithRacePoint = {
    ...horse,
    race: horse.race.map((r) => ({ ...r, date: r.date.toISOString() })),
    ...aggregateRacePoint(horse.race),
  };

  // x-x-x-x形式で結果を集計
  const raceResults: Props["raceResults"] = horseWithRacePoint.race.reduce(
    (result, cuur) => {
      switch (cuur.result) {
        case 1:
          result.first++;
          break;
        case 2:
          result.second++;
          break;
        case 3:
          result.third++;
          break;
        default:
          result.other++;
          break;
      }
      return result;
    },
    { first: 0, second: 0, third: 0, other: 0 }
  );

  return {
    props: {
      owner,
      horseWithRacePoint,
      raceResults,
    },
  };
};

const HorseIdPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  owner,
  horseWithRacePoint,
  raceResults,
}) => {
  return (
    <>
      <Head>
        <title>{`${horseWithRacePoint.name} | おうちPOG`}</title>
        <meta name="description" content="POG" />
      </Head>
      <div className="artboard p-5 bg-[#f6d7b030] h-[100vh]">
        <div className="text-sm breadcrumbs">
          <ul>
            <li>
              <Link href={"/"}>TOP</Link>
            </li>
            <li>
              <Link href={"/2022-2023"}>2022-2023</Link>
            </li>
            <li>
              <Link href={"/2022-2023/dart"}>ダート馬POG</Link>
            </li>
            <li>
              <Link href={`/2022-2023/dart/${owner.id}`}>{owner.name}</Link>
            </li>
            <li>{horseWithRacePoint.name}</li>
          </ul>
        </div>

        <div className="mt-4 flex items-center justify-start">
          <h1
            className={`font-bold text-2xl ${
              horseWithRacePoint.genderCategory === "MALE"
                ? "text-primary"
                : "text-secondary"
            }`}
          >
            <a href={horseWithRacePoint.url} target="_blank" rel="noreferrer">
              {horseWithRacePoint.name}
            </a>
          </h1>
          <div className="ml-4">
            <Stable
              region={horseWithRacePoint.region}
              name={horseWithRacePoint.stable}
            />
          </div>
        </div>
        {!horseWithRacePoint.enable && (
          <div className="mt-2 ml-2 text-slate-100 rounded-full bg-gray-400 py-1 px-2 font-semibold w-[64px] text-center">
            <span>失格</span>
          </div>
        )}

        <div className="border-b-2 border-accent border-dotted mx-2 flex items-center mt-4">
          <span className="text-transparent text-shadow text-xl">
            &#128178;
          </span>
          <span className="ml-2 text-lg font-semibold">成績</span>
        </div>
        <div className="flex flex-col mx-2 p-1 ">
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">合計　　　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">
                {horseWithRacePoint.totalPoint}
              </span>
              <span className="ml-2">ポイント</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">基礎合計　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">
                {horseWithRacePoint.totalBasePoint}
              </span>
              <span className="ml-2">ポイント</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">平均オッズ：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">
                {horseWithRacePoint.averageOdds !== 0
                  ? horseWithRacePoint.averageOdds
                  : "-"}
              </span>
              <span className="ml-2">倍</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">戦績　　　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{raceResults.first}</span>
              <span className="ml-2">-</span>
              <span className="font-mono text-xl ml-2">
                {raceResults.second}
              </span>
              <span className="ml-2">-</span>
              <span className="font-mono text-xl ml-2">
                {raceResults.third}
              </span>
              <span className="ml-2">-</span>
              <span className="font-mono text-xl ml-2">
                {raceResults.other}
              </span>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-accent border-dotted mx-2 flex items-center mt-4">
          <span className="text-transparent text-shadow text-xl">
            &#127942;
          </span>
          <span className="ml-2 text-lg font-semibold">レース</span>
        </div>
        <div className="mt-4 mx-2 p-1 w-[300px]">
          {horseWithRacePoint.race.map((race, index) => (
            <div key={race.id}>
              {index !== 0 && <div className="divider mt-1 mb-1" />}
              <RaceItem {...race} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default HorseIdPage;
