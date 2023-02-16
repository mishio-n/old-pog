import { Race } from "@prisma/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Portal } from "./Portal";

type Props = {
  onClose: () => void;
};

type RouteParams = {
  category?: number;
  ownerId?: number;
  horseId?: number;
};

export const RaceForm: React.FC<Props> = ({ onClose }) => {
  const [routeParams, setParams] = useState<RouteParams>();
  const [race, setRace] = useState("");
  const [result, setResult] = useState(0);
  const [odds, setOdds] = useState(0);
  const [point, setPoint] = useState(0);
  const [date, setDate] = useState<Date>(new Date());
  const [loading, setLoading] = useState(false);

  const postRaceResult = useCallback(async () => {
    const body: Omit<Race, "id"> = {
      horseId: routeParams!.horseId!,
      race,
      odds,
      point,
      date,
      result,
    };

    setLoading(true);
    await fetch("/api/race", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })
      .then(() => {
        onClose();
      })
      .catch((error) => console.log(error));
  }, [routeParams, race, result, odds, point, date]);

  const canClick = useMemo(
    () =>
      routeParams?.category &&
      routeParams.ownerId &&
      routeParams.horseId &&
      race !== "" &&
      result !== 0,
    [routeParams, race, result, odds, point, date]
  );

  useEffect(() => {
    const [_, season, rule, owner, horse] = window.location.pathname.split("/");
    setParams({
      category: !season || !rule ? undefined : rule === "odds" ? 1 : 2,
      ownerId: owner === undefined ? undefined : +owner,
      horseId: horse === undefined ? undefined : +horse,
    });
  }, [window.location.pathname]);

  return (
    <Portal>
      <div
        className="absolute top-0 left-0 w-full h-full bg-[rgba(0,0,0,0.5)] flex justify-center items-center z-50"
        onClick={() => onClose()}
      >
        <div
          className="bg-slate-50 w-64 h-[512px] rounded-md"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-end">
            <button
              className="btn btn-square btn-ghost text-3xl"
              onClick={() => onClose()}
            >
              ×
            </button>
          </div>

          <div className="flex flex-col px-4">
            <label className="flex flex-col mt-2">
              <span>レース日</span>
              <input
                type="date"
                onChange={(e) => setDate(new Date(e.target.value))}
              />
            </label>
            <label className="flex flex-col mt-2">
              <span>レース</span>
              <input
                type="text"
                placeholder="レース名"
                onChange={(e) => setRace(e.target.value)}
              />
            </label>
            <label className="flex flex-col mt-2">
              <span>オッズ</span>
              <div className="flex mt-1">
                <input
                  type="number"
                  placeholder="0"
                  onChange={(e) => setOdds(+e.target.value)}
                  className="w-12"
                />
                <span className="ml-2">倍</span>
              </div>
            </label>
            <label className="flex flex-col mt-2">
              <span>ポイント</span>
              <div className="flex mt-1">
                <input
                  type="number"
                  placeholder="0"
                  onChange={(e) => setPoint(+e.target.value)}
                  className="w-12"
                />
                <span className="ml-2">point</span>
              </div>
            </label>
            <label className="flex flex-col mt-2">
              <span>結果</span>
              <div className="flex mt-1">
                <input
                  type="number"
                  onChange={(e) => setResult(+e.target.value)}
                  className="w-12"
                />
                <span className="ml-2">着</span>
              </div>
            </label>
          </div>

          <div className="mt-12 text-center">
            <button
              className="btn btn-info text-slate-50 w-[120px] shadow-md"
              onClick={() => postRaceResult()}
              disabled={!canClick || loading}
            >
              登録する
            </button>
            {loading && (
              <div className="flex justify-center mt-4">
                <svg
                  version="1.1"
                  id="Layer_1"
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="24px"
                  height="30px"
                  viewBox="0 0 24 30"
                >
                  <rect x="0" y="13" width="4" height="5" fill="#494949">
                    <animate
                      attributeName="height"
                      attributeType="XML"
                      values="5;21;5"
                      begin="0s"
                      dur="0.6s"
                      repeatCount="indefinite"
                    ></animate>
                    <animate
                      attributeName="y"
                      attributeType="XML"
                      values="13; 5; 13"
                      begin="0s"
                      dur="0.6s"
                      repeatCount="indefinite"
                    ></animate>
                  </rect>
                  <rect x="10" y="13" width="4" height="5" fill="#494949">
                    <animate
                      attributeName="height"
                      attributeType="XML"
                      values="5;21;5"
                      begin="0.15s"
                      dur="0.6s"
                      repeatCount="indefinite"
                    ></animate>
                    <animate
                      attributeName="y"
                      attributeType="XML"
                      values="13; 5; 13"
                      begin="0.15s"
                      dur="0.6s"
                      repeatCount="indefinite"
                    ></animate>
                  </rect>
                  <rect x="20" y="13" width="4" height="5" fill="#494949">
                    <animate
                      attributeName="height"
                      attributeType="XML"
                      values="5;21;5"
                      begin="0.3s"
                      dur="0.6s"
                      repeatCount="indefinite"
                    ></animate>
                    <animate
                      attributeName="y"
                      attributeType="XML"
                      values="13; 5; 13"
                      begin="0.3s"
                      dur="0.6s"
                      repeatCount="indefinite"
                    ></animate>
                  </rect>
                </svg>
              </div>
            )}
          </div>
        </div>
      </div>
    </Portal>
  );
};
