import { useMemo } from "react";

export const useOrigin = () =>
  useMemo(() => {
    if (typeof window === "undefined") return "";
    return window.location.origin;
  }, []);
