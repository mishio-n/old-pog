import { type Race } from "@prisma/client";

export type RacePoint = {
  totalPoint: number;
  totalBasePoint: number;
  averageOdds: number;
};

export const aggregateRacePoint = (races: Race[]): RacePoint => {
  const averageOdds =
    races.length === 0
      ? 0
      : Math.round(
          (races.reduce((result, race) => result + race.odds, 0) /
            races.length) *
            10
        ) / 10;
  return races.reduce(
    (result, race) => ({
      totalBasePoint: result.totalBasePoint + race.point,
      totalPoint: result.totalPoint + Math.round(race.point * race.odds),
      averageOdds,
    }),
    { totalBasePoint: 0, totalPoint: 0, averageOdds } as RacePoint
  );
};
