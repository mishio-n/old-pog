import { type Owner, type Horse } from ".prisma/client";
import {
  GetStaticPaths,
  GetStaticProps,
  InferGetStaticPropsType,
  NextPage,
} from "next";
import Head from "next/head";
import Link from "next/link";
import { prisma } from "../../../../lib/prisma";

type Props = {
  owner: Owner & { Horse: Horse[] };
};

export const getStaticPaths: GetStaticPaths = async () => {
  const owners = await prisma.owner.findMany();
  const paths = owners.map((owner) => `/2022-2023/odds/${owner.id}`);

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
    include: { Horse: true },
  });

  if (owner === null) {
    throw new Error("Not found");
  }

  return {
    props: {
      owner,
    },
  };
};

const Odds2022_2023: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ owner }) => {
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
            <li>{owner.name}</li>
          </ul>
        </div>
        <div className="artboard p-5">
          {owner.Horse.map((horse) => (
            <div className="flex" key={horse.id}>
              <span>{horse.name}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Odds2022_2023;
