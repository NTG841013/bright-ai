"use client";

import { useEffect, useState } from "react";

export function usePlatform() {
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf('MAC') >= 0);
  }, []);

  return { isMac };
}
