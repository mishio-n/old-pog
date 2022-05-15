import Link from "next/link";

export const Header: React.FC = () => (
  <div className="navbar bg-neutral text-neutral-content shadow-gray-700 shadow-md sticky left-0 top-0 z-50">
    <Link href={"/"}>
      <a className="btn btn-ghost normal-case text-xl no-animation">
        おうちPOG
      </a>
    </Link>
  </div>
);
