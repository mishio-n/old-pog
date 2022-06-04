import { type Race } from "@prisma/client";

export type RacePoint = {
  totalPoint: number;
  totalBasePoint: number;
  averageOdds: number;
};

export const aggregateRacePoint = (races: Race[]): RacePoint => {
  const averageOdds =
    races.reduce((result, race) => result + race.odds, 0) / races.length;
  return races.reduce(
    (result, race) => ({
      totalBasePoint: result.totalBasePoint + race.point,
      totalPoint: result.totalBasePoint + race.point * race.odds,
      averageOdds,
    }),
    {} as RacePoint
  );
};
