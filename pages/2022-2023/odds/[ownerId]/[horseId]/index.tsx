import { type Horse, type Owner, type Race } from ".prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import { prisma } from "~/lib/prisma";
import { aggregateRacePoint } from "~/lib/race-point";

type Props = {
  owner: Owner;
  horseWithRacePoint: Horse & { race: Race[] } & ReturnType<
      typeof aggregateRacePoint
    >;
};

export const getStaticPaths: GetStaticPaths = async () => {
  const owners = await prisma.owner.findMany({ include: { Horse: true } });
  const paths = owners
    .map((owner) =>
      owner.Horse.map((horse) => `/2022-2023/odds/${owner.id}/${horse.id}`)
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
  const [isShowTotalPoint, setShowTotoalPoint] = useState(true);

  // const sumPoint = useCallback(
  //   () =>
  //     horsesWithRacePoint.reduce(
  //       (result, curr) =>
  //         result + (isShowTotalPoint ? curr.totalPoint : curr.totalBasePoint),
  //       0
  //     ),
  //   [isShowTotalPoint]
  // );

  // const sumRaceResult = useCallback(() => {
  //   const races = horsesWithRacePoint.map((horse) => horse.race).flat();
  //   const firstResults = races.filter((race) => race.result === 1);
  //   return {
  //     first: firstResults.length,
  //     total: races.length,
  //   };
  // }, []);

  // const ageraveOdds = useCallback(() => {
  //   const debuted = horsesWithRacePoint.filter(
  //     (horse) => horse.race.length !== 0
  //   );
  //   return debuted.length === 0
  //     ? "-"
  //     : Math.round(
  //         (debuted.reduce((result, curr) => result + curr.averageOdds, 0) /
  //           debuted.length) *
  //           10
  //       ) / 10;
  // }, []);

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

        <div className="form-control px-2">
          <label className="label cursor-pointer">
            <span className="label-text text-sm">オッズ計算後を表示する</span>
            <input
              type="checkbox"
              className="toggle toggle-accent"
              checked={isShowTotalPoint}
              onChange={(e) => setShowTotoalPoint(e.target.checked)}
            />
          </label>
        </div>
        <div className="border-b-2 border-accent border-dotted mx-2 flex items-center mt-2">
          <span className="text-transparent text-shadow text-xl">
            &#128178;
          </span>
          <span className="ml-2 text-lg font-semibold">成績</span>
        </div>
        <div className="flex flex-col mx-2 p-1 ">
          <div className="flex justify-between mt-2 w-[240px] items-center">
            <span className="font-semibold">合計　　　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{0}</span>
              <span className="ml-2">ポイント</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[240px] items-center">
            <span className="font-semibold">平均オッズ：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{0}</span>
              <span className="ml-2">倍</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[240px] items-center">
            <span className="font-semibold">戦績　　　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{0}</span>
              <span className="ml-2">戦</span>
              <span className="font-mono text-xl ml-2">{0}</span>
              <span className="ml-2">勝</span>
            </div>
          </div>
        </div>

        <div className="border-b-2 border-accent border-dotted mx-2 flex items-center mt-4">
          <span className="text-transparent text-shadow text-xl">
            &#128014;
          </span>
          <span className="ml-2 text-lg font-semibold">指名馬</span>
        </div>
      </div>
    </>
  );
};

export default HorseIdPage;
