"use client";

import { Fragment, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import clsx from "@/lib/shared/ClassesUtils";
import UrlUtils from "@/utils/app/UrlUtils";

export interface TabItem {
  name: any;
  routePath?: string;
}

interface Props {
  className?: string;
  tabs: TabItem[];
  asLinks?: boolean;
  breakpoint?: "sm" | "md" | "lg" | "xl" | "2xl";
  onSelected?: (idx: number) => void;
  exact?: boolean;
}

export default function TabsVertical({ className = "", tabs = [], asLinks = true, onSelected, exact, breakpoint = "md" }: Props) {
  const { t } = useTranslation();

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selected, setSelected] = useState(0);

  useEffect(() => {
    tabs.forEach((tab, index) => {
      if (tab.routePath && (pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")).includes(tab.routePath)) {
        setSelected(index);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabs, pathname]);

  function selectTab(idx: number) {
    const tab = tabs[idx];
    setSelected(idx);
    if (asLinks) {
      if (tab?.routePath) {
        router.push(tab.routePath);
      }
    } else {
      if (onSelected) {
        onSelected(idx);
      }
    }
  }
  function isCurrent(idx: number) {
    return currentTab() === tabs[idx];
  }
  const currentTab = () => {
    if (asLinks) {
      if (exact) {
        return tabs.find((element) => element.routePath && UrlUtils.stripTrailingSlash(pathname) === UrlUtils.stripTrailingSlash(element.routePath));
      } else {
        const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
        return tabs.find((element) => element.routePath && (pathname + search).includes(element.routePath));
      }
    } else {
      return tabs[selected];
    }
  };
  return (
    <nav className={clsx("w-full space-y-1", className)} aria-label="Sidebar">
      <div
        className={clsx(
          breakpoint === "sm" && "sm:hidden",
          breakpoint === "md" && "md:hidden",
          breakpoint === "lg" && "lg:hidden",
          breakpoint === "xl" && "xl:hidden",
          breakpoint === "2xl" && "2xl:hidden"
        )}
      >
        <label htmlFor="tabs" className="sr-only">
          {t("app.shared.tabs.select")}
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-border focus:border-theme-500 focus:ring-ring"
          onChange={(e) => selectTab(Number(e.target.value))}
          value={selected}
        >
          {tabs.map((item, idx) => {
            return (
              <option key={item.name} value={Number(idx)}>
                {item.name}
              </option>
            );
          })}
        </select>
      </div>
      <div
        className={clsx(
          breakpoint === "sm" && "hidden sm:block",
          breakpoint === "md" && "hidden md:block",
          breakpoint === "lg" && "hidden lg:block",
          breakpoint === "xl" && "hidden xl:block",
          breakpoint === "2xl" && "hidden 2xl:block"
        )}
      >
        {tabs.map((item, idx) => (
          <Fragment key={item.name}>
            {item.routePath ? (
              <Link
                href={item.routePath ?? ""}
                className={clsx(
                  "border",
                  isCurrent(idx)
                    ? "shadow-2xs border-border bg-secondary/90 font-bold text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                  "flex items-center rounded-md px-3 py-2 text-sm"
                )}
              >
                <span className="truncate">{item.name}</span>
              </Link>
            ) : (
              <button
                type="button"
                className={clsx(
                  isCurrent(idx)
                    ? "shadow-2xs border-border bg-secondary/90 font-bold text-foreground"
                    : "border-transparent text-muted-foreground hover:bg-secondary hover:text-foreground",
                  "flex w-full items-center justify-center rounded-md border px-3 py-2 text-sm"
                )}
                onClick={() => selectTab(idx)}
              >
                <span className="truncate">{item.name}</span>
              </button>
            )}
          </Fragment>
        ))}
      </div>
    </nav>
  );
}
