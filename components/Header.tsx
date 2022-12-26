import dynamic from "next/dynamic";
import Link from "next/link";

export const Header: React.FC = () => {
  const RaceResultButton = dynamic(() => import("./RaceResultButton"), {
    ssr: false,
  });

  return (
    <div className="navbar bg-neutral text-neutral-content shadow-gray-700 shadow-md sticky left-0 top-0 z-50">
      <Link
        href={"/"}
        className="btn btn-ghost normal-case text-xl no-animation text-white"
      >
        おうちPOG
      </Link>
      <RaceResultButton />
    </div>
  );
};
