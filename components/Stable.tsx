import { type Region } from "@prisma/client";

type Props = {
  region: Region;
  name: string;
};

export const Stable: React.FC<Props> = ({ region, name }) => {
  const regionBgColor =
    region === "MIHO"
      ? "bg-[#ff6881]"
      : region === "RITTO"
      ? "bg-[#3D96D6]"
      : "bg-accent";

  return (
    <div className="flex items-center">
      <div className={`w-[18px] h-[18px] rounded-full ${regionBgColor}`} />
      <span className="ml-1">{name}</span>
    </div>
  );
};
