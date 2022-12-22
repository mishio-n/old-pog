import { ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Props = {
  children: ReactNode;
};

export const Portal: React.FC<Props> = ({ children }) => {
  const ref = useRef<Element | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    ref.current = document.querySelector<HTMLElement>("#modal");
    setMounted(true);
  }, []);

  return mounted && ref.current
    ? createPortal(<div>{children}</div>, ref.current)
    : null;
};
