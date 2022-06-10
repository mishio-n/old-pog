import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import { useEffect, useState } from "react";
import { asyncReader } from "~/lib/async-reader";

type PogRecord = {
  owner: string;
  horse: string;
  price: number;
  point: number;
};

export const getStaticProps: GetStaticProps<{
  pogData: PogRecord[];
}> = async () => {
  const dataPath = path.join(process.cwd(), "data/2022-2023/chiba-sale.csv");
  const reader = asyncReader(dataPath, {
    owner: 0,
    horse: 1,
    price: 2,
    point: 3,
  });

  const _ = await reader.next();
  const pogData: PogRecord[] = [];

  for await (const line of reader) {
    pogData.push({ ...line, price: +line.price, point: +line.point });
  }

  return {
    props: { pogData },
  };
};

const ChibaIndex: NextPage<InferGetStaticPropsType<typeof getStaticProps>> = ({
  pogData,
}) => {
  const owners = pogData.reduce((result, row) => {
    if (result.includes(row.owner)) {
      return result;
    }
    result.push(row.owner);
    return result;
  }, [] as string[]);

  const [dataSource, setDataSource] = useState(pogData);
  const [sortedKey, setsortedKey] = useState<keyof PogRecord>("owner");
  const [orderBy, setOrderBy] = useState<"desc" | "asc">("desc");

  const sort = (key: keyof PogRecord) => {
    if (sortedKey === key) {
      setOrderBy(orderBy === "desc" ? "asc" : "desc");
    }
    setsortedKey(key);
  };

  const ownerFilter = (owner: string, checked: boolean) => {
    if (checked) {
      const ownerData = pogData.filter((row) => row.owner === owner);
      setDataSource(dataSource.concat(ownerData));
      return;
    }

    const filtered = Array.from(dataSource).filter(
      (row) => row.owner !== owner
    );
    setDataSource(filtered);
  };

  const isSorted = (key: keyof PogRecord) => sortedKey === key;

  useEffect(() => {
    const sorted = Array.from(dataSource).sort((a, b) => {
      if (a[sortedKey] > b[sortedKey]) {
        return orderBy === "asc" ? 1 : -1;
      }
      if (a[sortedKey] < b[sortedKey]) {
        return orderBy === "asc" ? -1 : 1;
      }
      return 0;
    });
    setDataSource(sorted);
  }, [sortedKey, orderBy]);

  return (
    <>
      <Head>
        <title>千葉サラブレッドセール2022 | おうちPOG</title>
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
            <li>千葉サラブレッドセール2022</li>
          </ul>
        </div>

        <div className="flex-row flex mt-4 justify-start">
          {owners.map((owner) => (
            <label className="label cursor-pointer" key={`checkbox-${owner}`}>
              <input
                type="checkbox"
                className="checkbox checkbox-sm"
                defaultChecked={true}
                onChange={(event) => ownerFilter(owner, event.target.checked)}
              />
              <span className="label-text ml-2 text-sm">{owner}</span>
            </label>
          ))}
        </div>

        <div className="overflow-x-auto mt-8">
          <table className="table w-full">
            <thead>
              <tr>
                <td
                  onClick={() => sort("owner")}
                  className={
                    isSorted("owner")
                      ? " box-border border-b-2 border-b-accent"
                      : ""
                  }
                >
                  オーナー
                </td>
                <th
                  onClick={() => sort("horse")}
                  className={
                    isSorted("horse")
                      ? " box-border border-b-2 border-b-accent"
                      : ""
                  }
                >
                  馬名
                </th>
                <th
                  onClick={() => sort("price")}
                  className={
                    isSorted("price")
                      ? " box-border border-b-2 border-b-accent"
                      : ""
                  }
                >
                  購買価格
                </th>
                <th
                  onClick={() => sort("point")}
                  className={
                    isSorted("point")
                      ? " box-border border-b-2 border-b-accent"
                      : ""
                  }
                >
                  ポイント
                </th>
              </tr>
            </thead>
            <tbody>
              {dataSource.map((row) => (
                <tr key={`${row.owner}-${row.horse}`}>
                  <td>{row.owner}</td>
                  <td>{row.horse}</td>
                  <td>{row.price} 万円</td>
                  <td>{row.point} pt</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
};

export default ChibaIndex;
