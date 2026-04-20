"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState, type ReactNode } from "react";

export type AccordionItem = {
  id: string;
  question: string;
  answer: ReactNode;
};

type Props = { items: AccordionItem[] };

export function Accordion({ items }: Props) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <ul className="divide-y divide-primary-pale rounded-2xl bg-white ring-1 ring-primary-pale">
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <li key={item.id}>
            <button
              type="button"
              aria-expanded={isOpen}
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left text-lg font-medium text-primary-dark focus:outline-none focus-visible:bg-primary-pale/50"
            >
              <span>{item.question}</span>
              <span
                aria-hidden
                className={`text-2xl text-primary transition-transform ${
                  isOpen ? "rotate-45" : ""
                }`}
              >
                +
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="panel"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="overflow-hidden"
                >
                  <div className="px-6 pb-6 text-muted">{item.answer}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        );
      })}
    </ul>
  );
}
