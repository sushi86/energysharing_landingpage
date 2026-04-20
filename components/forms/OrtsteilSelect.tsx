import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";

import { ORTSTEIL_GROUPS, OTHER_OPTION } from "@/lib/ortsteile";

type Props = SelectHTMLAttributes<HTMLSelectElement>;

export const OrtsteilSelect = forwardRef<HTMLSelectElement, Props>(function OrtsteilSelect(
  props,
  ref,
) {
  return (
    <select
      ref={ref}
      {...props}
      className="min-h-[48px] w-full rounded-lg border border-primary-dark/20 bg-white px-3 py-2 text-base focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/40"
    >
      <option value="">Bitte wählen …</option>
      {ORTSTEIL_GROUPS.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.items.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </optgroup>
      ))}
      <option value={OTHER_OPTION}>{OTHER_OPTION}</option>
    </select>
  );
});
