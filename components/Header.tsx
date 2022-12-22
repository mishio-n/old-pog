import Link from "next/link";
import { useEffect, useState } from "react";
import { RaceForm } from "./RaceForm";

export const Header: React.FC = () => {
  const [open, setOpen] = useState(false);
  useEffect(() => {}, [open]);

  return (
    <div className="navbar bg-neutral text-neutral-content shadow-gray-700 shadow-md sticky left-0 top-0 z-50">
      <Link
        href={"/"}
        className="btn btn-ghost normal-case text-xl no-animation text-white"
      >
        おうちPOG
      </Link>
      <div>
        <button
          onClick={() => setOpen((p) => !p)}
          className="btn bg-slate-50 rounded-full flex items-center ml-16 py-0 px-3 hover:bg-slate-50 shadow-sm shadow-slate-50 border-none"
        >
          <span className="text-transparent text-shadow text-xl">
            &#9999;&#65039;
          </span>
          <span className="ml-1 text-accent font-bold">レース結果</span>
        </button>
        {open && <RaceForm onClose={() => setOpen(false)} />}
      </div>
    </div>
  );
};
