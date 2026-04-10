"use client";

import { useId } from "react";

type Props = {
  text: string;
  label?: string;
};

/**
 * Visible hover/focus tooltip (native `title` is unreliable in many browsers/UI settings).
 */
export function InfoTooltip({ text, label = "More information" }: Props) {
  const tipId = useId();

  return (
    <span className="group relative inline-flex align-middle">
      <button
        type="button"
        aria-label={label}
        aria-describedby={tipId}
        className="ml-1 inline-flex h-5 w-5 shrink-0 cursor-help items-center justify-center rounded-full border border-black/20 text-[10px] font-semibold leading-none text-black/60 outline-offset-2 transition-colors hover:border-black/40 hover:text-black focus-visible:ring-2 focus-visible:ring-black/25 dark:border-white/25 dark:text-white/60 dark:hover:border-white/45 dark:hover:text-white dark:focus-visible:ring-white/30"
      >
        ?
      </button>
      <span
        id={tipId}
        role="tooltip"
        className="invisible absolute bottom-full left-1/2 z-[200] mb-1 w-[min(18rem,calc(100vw-2rem))] -translate-x-1/2 rounded-lg border border-black/15 bg-white px-3 py-2 text-left text-xs leading-snug text-black/90 opacity-0 shadow-lg ring-1 ring-black/5 transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 dark:border-white/20 dark:bg-zinc-900 dark:text-white/90 dark:ring-white/10"
      >
        {text}
      </span>
    </span>
  );
}
