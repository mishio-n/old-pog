import { NextPage } from "next";
import Head from "next/head";
import Link from "next/link";

const Pog2022_2023: NextPage = () => {
  return (
    <>
      <Head>
        <title>2022-2023 | おうちPOG</title>
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
          </ul>
        </div>
        <div className="flex flex-wrap">
          <div className="p-5">
            <Link href={"/2022-2023/odds"}>
              <div className="card max-w-sm bg-base-100 shadow-xl">
                <div className="card-body items-center flex-row pl-5">
                  <div className="border-secondary border-l-4 border-dotted h-10" />
                  <h2 className="card-title whitespace-nowrap text-lg  ml-2">
                    オッズ傾斜POG
                  </h2>
                </div>
              </div>
            </Link>
          </div>
          <div className="p-5">
            <Link href={"/2022-2023/chiba"}>
              <div className="card max-w-sm bg-base-100 shadow-xl">
                <div className="card-body items-center flex-row pl-5">
                  <div className="border-lime-500 border-l-4 border-dotted h-10" />
                  <h2 className="card-title whitespace-nowrap  text-lg ml-2">
                    千葉サラブレッドセール2022
                  </h2>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Pog2022_2023;
