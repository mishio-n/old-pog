import { type Owner } from ".prisma/client";
import { gsap } from "gsap";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
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
  const pointRefs = useRef(
    range(0, ownerWithPoints.length - 1).map(() => createRef<HTMLSpanElement>())
  );

  // カウントアップアニメーション
  useEffect(() => {
    pointRefs.current.forEach((pointRef) => {
      const point = pointRef.current?.dataset.point!;
      let obj = { count: 0 };
      gsap.to(obj, {
        count: point,
        ease: "power3.inOut",
        duration: 3.6,
        onUpdate: () => {
          pointRef.current!.textContent = Math.floor(obj.count).toString();
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
      </div>
    </>
  );
};

export default Odds2022_2023;
