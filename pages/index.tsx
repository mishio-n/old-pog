import type { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>おうちPOG</title>
        <meta name="description" content="POG" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="p-5">
          <Link href={"/chiba"}>
            <div className="card max-w-sm bg-base-100 shadow-xl">
              <div className="card-body items-center flex-row">
                <div className="border-lime-500 border-l-2 border-solid h-10" />
                <h2 className="card-title">千葉サラブレッドセール2022</h2>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  );
};

export default Home;
