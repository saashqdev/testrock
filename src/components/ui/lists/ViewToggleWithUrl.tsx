"use client";

import clsx from "clsx";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TableIcon from "../icons/TableIcon";
import ViewBoardsIcon from "../icons/ViewBoardsIcon";

interface Props {
  defaultView?: "table" | "board";
  className?: string;
}
export default function ViewToggleWithUrl({ defaultView, className }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
  const [view, setView] = useState(newSearchParams.get("view") ?? defaultView ?? "table");
  const router = useRouter();

  useEffect(() => {
    const view = newSearchParams.get("view");
    if (view) {
      setView(view);
    }
  }, [searchParams]);

  // useEffect(() => {
  //   searchParams.set("view", view);
  //   setSearchParams(searchParams);
  // }, [view]);

  function onChange(value: "table" | "board") {
    newSearchParams.set("view", value);
    router.push(`${window.location.pathname}?${newSearchParams.toString()}`, { scroll: false });
  }
  return (
    <span className={clsx("shadow-2xs relative z-0 inline-flex rounded-md", className)}>
      <button
        onClick={() => onChange("table")}
        type="button"
        className={clsx(
          "focus:outline-hidden relative inline-flex items-center rounded-l-md border border-border px-4 py-2.5 font-medium hover:bg-secondary/90 focus:z-10 focus:border-border focus:ring-1 focus:ring-ring sm:text-sm",
          view === "table" ? "bg-accent-100 text-accent-500" : "bg-background text-foreground/80"
        )}
      >
        <TableIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => onChange("board")}
        type="button"
        className={clsx(
          "focus:outline-hidden relative -ml-px inline-flex items-center rounded-r-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary/90 focus:z-10 focus:border-border focus:ring-1 focus:ring-ring",
          view === "board" ? "bg-accent-100 text-accent-500" : "bg-background text-foreground/80"
        )}
      >
        <ViewBoardsIcon className="h-4 w-4" />
      </button>
    </span>
  );
}
