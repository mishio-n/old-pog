import { useState } from "react";
import { RaceForm } from "./RaceForm";

const RaceResultButton: React.FC = () => {
  const [open, setOpen] = useState(false);
  // 馬詳細ページ以外ではボタンを表示させない
  if (window.location.pathname.split("/").length !== 4) {
    return null;
  }

  return (
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
  );
};

export default RaceResultButton;
