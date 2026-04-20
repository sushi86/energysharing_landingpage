"use client";

import { useEffect, useState, type ReactNode } from "react";

export type Tab = {
  id: string;
  label: ReactNode;
  content: ReactNode;
};

type Props = {
  tabs: Tab[];
  defaultId?: string;
  /** If a location hash contains `?role=X` or the tab id, switch to it. */
  syncWithHash?: boolean;
};

export function TabSwitcher({ tabs, defaultId, syncWithHash }: Props) {
  const [active, setActive] = useState(defaultId ?? tabs[0].id);

  useEffect(() => {
    if (!syncWithHash) return;
    const parseHash = () => {
      const hash = window.location.hash; // "#warteliste?role=producer"
      const match = hash.match(/role=([a-z-]+)/i);
      if (match && tabs.some((t) => t.id === match[1])) {
        setActive(match[1]);
      }
    };
    parseHash();
    window.addEventListener("hashchange", parseHash);
    return () => window.removeEventListener("hashchange", parseHash);
  }, [syncWithHash, tabs]);

  return (
    <div>
      <div role="tablist" className="grid grid-cols-2 gap-2 rounded-xl bg-primary-pale p-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
            className={`rounded-lg px-4 py-3 text-sm font-semibold transition md:text-base ${
              active === t.id
                ? "bg-white text-primary-dark shadow-sm"
                : "text-primary-dark/70 hover:text-primary-dark"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="mt-6">
        {tabs.map((t) => (
          <div key={t.id} role="tabpanel" hidden={active !== t.id}>
            {t.content}
          </div>
        ))}
      </div>
    </div>
  );
}
