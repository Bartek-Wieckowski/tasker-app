import { useState, useEffect } from "react";

export function useMobileTabSync() {
  const [mobileActiveTab, setMobileActiveTab] = useState("all");

  const syncTab = (tab: string) => {
    setMobileActiveTab(tab);
  };

  return {
    mobileActiveTab,
    setMobileActiveTab: syncTab,
  };
}

// Global state for mobile tab sync
let globalMobileTab = "all";
let globalListeners: ((tab: string) => void)[] = [];

export function useMobileTabGlobal() {
  const [mobileActiveTab, setMobileActiveTab] = useState(globalMobileTab);

  useEffect(() => {
    const listener = (tab: string) => {
      setMobileActiveTab(tab);
    };

    globalListeners.push(listener);

    return () => {
      globalListeners = globalListeners.filter((l) => l !== listener);
    };
  }, []);

  const updateGlobalTab = (tab: string) => {
    globalMobileTab = tab;
    globalListeners.forEach((listener) => listener(tab));
  };

  return {
    mobileActiveTab,
    setMobileActiveTab: updateGlobalTab,
  };
}
