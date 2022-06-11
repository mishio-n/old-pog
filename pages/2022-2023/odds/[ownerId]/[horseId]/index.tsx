import { type Horse, type Owner, type Race } from ".prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { useCallback } from "react";
import { RaceItem } from "~/components/RaceItem";
import { Stable } from "~/components/Stable";
import { prisma } from "~/lib/prisma";
import { aggregateRacePoint } from "~/lib/race-point";

type Props = {
  owner: Owner;
  horseWithRacePoint: Horse & { race: Race[] } & ReturnType<
      typeof aggregateRacePoint
    >;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const owners = await prisma.owner.findMany();
  const horses = await prisma.horse.findMany({
    where: { pogCategory: { name: "2022-2023_normal" } },
  });
  const paths = owners
    .map((owner) =>
      horses
        .filter(({ ownerId }) => ownerId === owner.id)
        .map((horse) => `/2022-2023/odds/${owner.id}/${horse.id}`)
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
    include: { race: true },
  });

  if (horse === null) {
    throw new Error("Not found");
  }

  const horseWithRacePoint = {
    ...horse,
    ...aggregateRacePoint(horse.race),
  };

  return {
    props: {
      owner,
      horseWithRacePoint,
    },
  };
};

const HorseIdPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  owner,
  horseWithRacePoint,
}) => {
  // x-x-x-x形式で結果を集計
  const aggregateRaceResult = useCallback(
    () =>
      horseWithRacePoint.race.reduce(
        (result, curr) => {
          switch (curr.result) {
            case 1:
              result[0]++;
              break;
            case 2:
              result[2]++;
              break;
            case 3:
              result[3]++;
              break;
            default:
              result[3]++;
              break;
          }
          return result;
        },
        [0, 0, 0, 0]
      ),
    []
  );

  return (
    <>
      <Head>
        <title>{owner.name}の成績 | おうちPOG</title>
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
            <li>
              <Link href={"/2022-2023/odds"}>
                <a>オッズ傾斜POG</a>
              </Link>
            </li>
            <li>
              <Link href={`/2022-2023/odds/${owner.id}`}>
                <a>{owner.name}</a>
              </Link>
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
              <span className="font-mono text-xl">
                {aggregateRaceResult()[0]}
              </span>
              <span className="ml-2">-</span>
              <span className="font-mono text-xl ml-2">
                {aggregateRaceResult()[1]}
              </span>
              <span className="ml-2">-</span>
              <span className="font-mono text-xl ml-2">
                {aggregateRaceResult()[2]}
              </span>
              <span className="ml-2">-</span>
              <span className="font-mono text-xl ml-2">
                {aggregateRaceResult()[3]}
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
          {horseWithRacePoint.race.reverse().map((race, index) => (
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
