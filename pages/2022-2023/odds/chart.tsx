import { type Owner } from ".prisma/client";
import {
  CategoryScale,
  Chart,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { GetStaticProps, InferGetStaticPropsType, NextPage } from "next";
import { Line } from "react-chartjs-2";
import { groupBy } from "~/lib/group-by";
import { prisma } from "~/lib/prisma";
import { aggregateRacePoint } from "~/lib/race-point";

const CHART_BORDER_COLORS = ["#3ABFF8", "#36D399", "#FBBD23", "#F87272"];

const AGGREGATE_SPAN = {
  "2022/06": {
    start: new Date("2022-06-01"),
    end: new Date("2022-06-30"),
  },

  "2022/07": {
    start: new Date("2022-07-01"),
    end: new Date("2022-07-31"),
  },

  "2022/08": {
    start: new Date("2022-08-01"),
    end: new Date("2022-08-31"),
  },

  "2022/09": {
    start: new Date("2022-09-01"),
    end: new Date("2022-09-30"),
  },

  "2022/10": {
    start: new Date("2022-10-01"),
    end: new Date("2022-10-31"),
  },

  "2022/11": {
    start: new Date("2022-11-01"),
    end: new Date("2022-11-30"),
  },

  "2022/12": {
    start: new Date("2022-12-01"),
    end: new Date("2022-12-31"),
  },

  "2023/01": {
    start: new Date("2023-01-01"),
    end: new Date("2023-01-31"),
  },

  "2023/02": {
    start: new Date("2023-02-01"),
    end: new Date("2023-02-28"),
  },

  "2023/03": {
    start: new Date("2023-03-01"),
    end: new Date("2023-03-31"),
  },

  "2023/04": {
    start: new Date("2023-04-01"),
    end: new Date("2023-04-30"),
  },

  "2023/05": {
    start: new Date("2023-05-01"),
    end: new Date("2023-05-31"),
  },

  "2023/06": {
    start: new Date("2023-06-01"),
    end: new Date("2023-06-30"),
  },
  "2023/07": {
    start: new Date("2023-07-01"),
    end: new Date("2023-07-31"),
  },

  "2023/08": {
    start: new Date("2023-08-01"),
    end: new Date("2023-08-31"),
  },

  "2023/09": {
    start: new Date("2023-09-01"),
    end: new Date("2023-09-30"),
  },

  "2023/10": {
    start: new Date("2023-10-01"),
    end: new Date("2023-10-31"),
  },
} as const;

type Props = {
  ownerWithPoints: (Owner & { aggregatePoints: AGGREGATE_POINTS })[];
};

type AGGREGATE_POINTS = Record<keyof typeof AGGREGATE_SPAN, number>;

export const getStaticProps: GetStaticProps<Props> = async () => {
  const owners = await prisma.owner.findMany({ orderBy: { id: "asc" } });
  const horses = await prisma.horse.findMany({
    include: { race: true },
    where: { pogCategoryId: 1 },
  });
  const horsesByOwner = groupBy(horses, (h) => h.ownerId);
  const ownerWithPoints = owners.map(({ id, name }) => ({
    id,
    name,
    aggregatePoints: horsesByOwner[id].reduce(
      (result, horse) => {
        Object.entries(AGGREGATE_SPAN).forEach(([key, { start, end }]) => {
          const races = horse.race.filter(
            (r) =>
              start.getTime() <= r.date.getTime() &&
              r.date.getTime() <= end.getTime()
          );
          result[key] = result[key] + aggregateRacePoint(races).totalPoint;
        });
        return result;
      },
      {
        "2022/06": 0,
        "2022/07": 0,
        "2022/08": 0,
        "2022/09": 0,
        "2022/10": 0,
        "2022/11": 0,
        "2022/12": 0,
        "2023/01": 0,
        "2023/02": 0,
        "2023/03": 0,
        "2023/04": 0,
        "2023/05": 0,
        "2023/06": 0,
        "2023/07": 0,
        "2023/08": 0,
        "2023/09": 0,
        "2023/10": 0,
      } as AGGREGATE_POINTS
    ),
  }));

  return {
    props: {
      ownerWithPoints,
    },
  };
};

const ChartOdds2022_2023: NextPage<
  InferGetStaticPropsType<typeof getStaticProps>
> = ({ ownerWithPoints }) => {
  Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
  );

  const labels = Object.keys(AGGREGATE_SPAN);
  const graphData = {
    labels: labels,
    datasets: ownerWithPoints.map((owner, i) => ({
      label: owner.name,
      borderColor: CHART_BORDER_COLORS[i],
      // 各月までの合計値をグラフデータとする
      data: Object.values(owner.aggregatePoints).reduce(
        (result, current, i) => {
          if (i === 0) {
            result.push(current);
            return result;
          }
          result.push(result[i - 1] + current);
          return result;
        },
        [] as number[]
      ),
    })),
  };

  const options = {
    responsive: true,
  };

  return (
    <div className="m-4 overflow-x-auto">
      {/* TODO: レスポンシブにしたい */}
      <Line height={600} data={graphData} options={options} id="chart" />
    </div>
  );
};

export default ChartOdds2022_2023;
