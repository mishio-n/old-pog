import { type Owner } from ".prisma/client";
import { gsap } from "gsap";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import Router from "next/router";
import { createRef, useEffect, useRef } from "react";
import { groupBy } from "~/lib/group-by";
import { prisma } from "~/lib/prisma";
import { aggregateRacePoint } from "~/lib/race-point";
import { range } from "~/lib/range";

type Props = {
  ownerWithPoints: (Owner & { totalPoint: number })[];
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const owners = await prisma.owner.findMany();
  const horses = await prisma.horse.findMany({
    include: { race: true },
    where: { pogCategoryId: 1 },
  });
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
  const pointRefs = useRef(
    range(0, ownerWithPoints.length - 1).map(() => createRef<HTMLSpanElement>())
  );

  // カウントアップアニメーション
  useEffect(() => {
    const firstPoint = +pointRefs.current[0].current?.dataset.point!;
    pointRefs.current.forEach((pointRef) => {
      const point = +pointRef.current?.dataset.point!;
      let obj = { count: 0 };
      gsap.to(obj, {
        count: point,
        ease: "power3.inOut",
        // ポイントに応じてアニメーション時間を変化させる
        duration: 3.6 * (point / firstPoint),
        onUpdate: () => {
          // アニメーション中の画面遷移を考慮
          if (pointRef.current === null) {
            return;
          }
          pointRef.current.textContent = Math.floor(obj.count).toString();
        },
      });
    });
  }, []);

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
              <Link href={"/"}>TOP</Link>
            </li>
            <li>
              <Link href={"/2022-2023"}>2022-2023</Link>
            </li>
            <li>オッズ傾斜POG</li>
          </ul>
        </div>
        <div className="artboard px-2">
          {ownerWithPoints.map((owner, index) => (
            <Link href={`/2022-2023/odds/${owner.id}`} key={owner.id}>
              <div
                className={`max-w-sm py-4 px-1 pb-0 mt-4 flex items-center justify-between ${
                  index === 0
                    ? "border-[#f7ef8e] border-b-4"
                    : index === 1
                    ? "border-[#cdd5e0] border-b-[3px]"
                    : "border-gray-300 border-b-2"
                }`}
              >
                <div className="card-title">{owner.name}</div>
                <div className="">
                  <span
                    className="point text-xl font-bold font-mono"
                    data-point={owner.totalPoint}
                    ref={pointRefs.current[index]}
                  >
                    {owner.totalPoint}
                  </span>
                  <span className="ml-2">ポイント</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button
            className="btn btn-info text-slate-50 w-[120px] shadow-md"
            onClick={() => Router.push("./odds/chart")}
          >
            グラフを見る
          </button>
        </div>
      </div>
    </>
  );
};

export default Odds2022_2023;
