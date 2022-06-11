import { type Race } from "@prisma/client";
import { useCallback } from "react";
import styles from "./raceItem.module.css";

type Props = Race;

export const RaceItem: React.FC<Props> = (props) => {
  const resultBgColor = useCallback(() => {
    switch (props.result) {
      case 1:
        return `bg-[#f7ef8e] ${styles.shine}`;
      case 2:
        return `bg-[#e1e7ef] ${styles.shine}`;
      case 3:
        return `bg-[#eaac6e] ${styles.shine}`;
      default:
        return "bg-gray-300 ";
    }
  }, []);

  return (
    <>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`relative flex items-end justify-center p-2 h-12 w-12 rounded-full ${resultBgColor()}`}
          >
            <span className="text-2xl font-mono">{props.result}</span>
            <span className="text-sm">着</span>
          </div>
          <span className="ml-4 text-xl whitespace-nowrap text-ellipsis w-32 overflow-hidden">
            {props.race}
          </span>
        </div>
        <div className="flex flex-col items-end">
          <div>
            <span className="ml-2 text-xl font-mono">
              {Math.round(props.odds * props.point)}
            </span>
            <span className="ml-2 text-sm">pt</span>
          </div>
          <div>
            <span className="text-sm font-mono">{props.odds}</span>
            <span className="text-xs px-2">×</span>
            <span className="text-sm font-mono">{props.point}</span>
          </div>
        </div>
      </div>
    </>
  );
};
