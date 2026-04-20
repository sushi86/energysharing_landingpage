"use client";

import { motion } from "framer-motion";

type Props = { children: React.ReactNode };

export function Badge({ children }: Props) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-medium text-primary-dark shadow-sm backdrop-blur">
      <motion.span
        className="block h-2.5 w-2.5 rounded-full bg-primary-light"
        animate={{ scale: [1, 1.4, 1], opacity: [1, 0.6, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      />
      <span>{children}</span>
    </div>
  );
}
