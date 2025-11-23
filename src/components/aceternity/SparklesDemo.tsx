"use client";

import clsx from "clsx";

export function SparklesDemo({ from, to }: { from: string; to: string }) {
  return (
    <div className="hidden flex-col items-center justify-center overflow-hidden md:flex">
      <div className="relative h-5 w-full">
        {/* Gradients */}
        <div className={clsx("bg-linear-to-r blur-xs absolute inset-x-0 top-0 h-[2px] w-3/4 from-transparent to-transparent", from)} />
        <div className={clsx("bg-linear-to-r absolute inset-x-1/4 top-0 h-px w-3/4 from-transparent to-transparent", from)} />
        <div className={clsx("bg-linear-to-r blur-xs absolute inset-x-1/4 top-0 h-[5px] w-2/4 from-transparent to-transparent", to)} />
        <div className={clsx("bg-linear-to-r absolute inset-x-1/4 top-0 h-px w-1/4 from-transparent to-transparent", to)} />
      </div>
    </div>
  );
}
