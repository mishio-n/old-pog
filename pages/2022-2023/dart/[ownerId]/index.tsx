import { type Horse, type Owner, type Race } from ".prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { useCallback, useState } from "react";
import { prisma } from "~/lib/prisma";
import { aggregateRacePoint } from "~/lib/race-point";

type Props = {
  owner: Owner;
  horsesWithRacePoint: (Horse & {
    race: (Omit<Race, "date"> & { date: string })[];
  } & ReturnType<typeof aggregateRacePoint>)[];
};

export const getStaticPaths: GetStaticPaths = async () => {
  const owners = await prisma.owner.findMany();
  const paths = owners.map((owner) => `/2022-2023/dart/${owner.id}`);

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

  const owner = await prisma.owner.findUnique({
    where: { id: +ownerId },
  });

  if (owner === null) {
    throw new Error("Not found");
  }

  const horses = await prisma.horse.findMany({
    where: { ownerId: owner.id, pogCategoryId: 2 },
    include: { race: true },
  });

  const horsesWithRacePoint = horses.map((horse) => ({
    ...horse,
    race: horse.race.map((r) => ({ ...r, date: r.date.toISOString() })),
    ...aggregateRacePoint(horse.race),
  }));

  return {
    props: {
      owner,
      horsesWithRacePoint,
    },
  };
};

const OwnerIdPage: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  owner,
  horsesWithRacePoint,
}) => {
  const [isShowTotalPoint, setShowTotoalPoint] = useState(false);

  const sumPoint = useCallback(
    () =>
      horsesWithRacePoint.reduce((result, curr) => {
        if (!curr.enable) {
          return result;
        }
        return (
          result + (isShowTotalPoint ? curr.totalPoint : curr.totalBasePoint)
        );
      }, 0),
    [isShowTotalPoint]
  );

  const sumRaceResult = useCallback(() => {
    const races = horsesWithRacePoint.map((horse) => horse.race).flat();
    const firstResults = races.filter((race) => race.result === 1);
    return {
      first: firstResults.length,
      total: races.length,
    };
  }, []);

  const ageraveOdds = useCallback(() => {
    const debuted = horsesWithRacePoint.filter(
      (horse) => horse.race.length !== 0
    );
    return debuted.length === 0
      ? "-"
      : Math.round(
          (debuted.reduce((result, curr) => result + curr.averageOdds, 0) /
            debuted.length) *
            10
        ) / 10;
  }, []);

  return (
    <>
      <Head>
        <title>{`${owner.name}の成績 | おうちPOG`}</title>
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
            <li>{owner.name}</li>
          </ul>
        </div>

        <div className="form-control px-2 items-start">
          <label className="label cursor-pointer">
            <span className="label-text text-sm">オッズ計算後を表示する</span>
            <input
              type="checkbox"
              className="toggle toggle-accent ml-2"
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
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">合計　　　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{sumPoint()}</span>
              <span className="ml-2">ポイント</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">平均オッズ：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{ageraveOdds()}</span>
              <span className="ml-2">倍</span>
            </div>
          </div>
          <div className="flex justify-between mt-2 w-[280px] items-center">
            <span className="font-semibold">戦績　　　：</span>
            <div className="ml-2 flex items-center">
              <span className="font-mono text-xl">{sumRaceResult().total}</span>
              <span className="ml-2">戦</span>
              <span className="font-mono text-xl ml-2">
                {sumRaceResult().first}
              </span>
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
        <div className="artboard px-2 py-2">
          {horsesWithRacePoint.map((horse) => (
            <Link
              href={`/2022-2023/dart/${owner.id}/${horse.id}`}
              key={horse.id}
            >
              <div className="flex justify-between items-center p-1">
                <span
                  className={`${
                    horse.enable
                      ? horse.genderCategory === "MALE"
                        ? "text-primary"
                        : "text-secondary"
                      : "text-gray-300"
                  }`}
                >
                  {horse.name}
                </span>
                <div>
                  <span
                    className={`font-mono  ${
                      horse.enable ? "" : "text-gray-400"
                    }`}
                  >
                    {isShowTotalPoint ? horse.totalPoint : horse.totalBasePoint}
                  </span>
                  <span
                    className={`ml-2 ${horse.enable ? "" : "text-gray-400"}`}
                  >
                    pt
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
};

export default OwnerIdPage;
