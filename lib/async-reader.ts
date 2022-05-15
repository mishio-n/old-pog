import fs from "fs";
import readline from "readline";

type LineObject<T> = Record<keyof T, string>;

export const asyncReader = async function* <
  T extends { [key: string]: number }
>(path: string, columns: T): AsyncGenerator<LineObject<T>> {
  const rl = readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity,
  });

  for await (const line of rl) {
    const values = line.split(",");
    const lineObject = Object.entries(columns).reduce(
      (obj, [key, position]) => ({ ...obj, [key]: values[position] }),
      {} as LineObject<T>
    );
    yield lineObject;
  }
};
