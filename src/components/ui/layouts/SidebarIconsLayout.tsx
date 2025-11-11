"use client";

import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useRef, useState } from "react";
import UrlUtils from "@/utils/app/UrlUtils";
import Tabs from "../tabs/Tabs";
import EntityIcon from "@/components/layouts/icons/EntityIcon";
import { cn } from "@/lib/utils";

export type IconDto = {
  name: string;
  href: string;
  icon?: React.ReactNode;
  iconSelected?: React.ReactNode;
  bottom?: boolean;
  exact?: boolean;
  textIcon?: string;
  textIconSelected?: string;
  hidden?: boolean;
};
export default function SidebarIconsLayout({
  children,
  items,
  label,
}: {
  children: React.ReactNode;
  items: IconDto[];
  label?: {
    align: "bottom" | "right";
  };
  scrollRestoration?: boolean;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mainElement = useRef<HTMLDivElement>(null);
  // useElementScrollRestoration({ apply: scrollRestoration ?? false }, mainElement);

  function findExactRoute(element: IconDto) {
    if (element.exact) {
      return UrlUtils.stripTrailingSlash(pathname) === UrlUtils.stripTrailingSlash(element.href);
    } else {
      return (pathname + (searchParams.toString() ? `?${searchParams.toString()}` : "")).includes(element.href);
    }
  }
  const currentTab = items.find((element) => findExactRoute(element));

  return (
    <div className="sm:flex sm:flex-row">
      <div
        className={cn(
          "shadow-2xs hidden flex-none flex-col items-center justify-between overflow-y-auto border-r border-border sm:flex",
          label?.align === "bottom" && "lg:text-center",
          "min-h-[calc(100vh-70px)]"
        )}
      >
        <div className="flex w-full flex-col items-center">
          {items
            .filter((f) => !f.bottom && !f.hidden)
            .map((item, idx) => {
              return <IconLink key={idx} {...item} current={currentTab?.name === item.name} label={label} />;
            })}
        </div>
        {items.filter((f) => f.bottom && !f.hidden).length > 0 && (
          <div className="flex w-full flex-col space-y-2 pb-5">
            {items
              .filter((f) => f.bottom && !f.hidden)
              .map((item, idx) => {
                return <IconLink key={idx} {...item} current={currentTab?.name === item.name} label={label} />;
              })}
          </div>
        )}
      </div>

      <div className="shadow-2xs w-full border-b border-border bg-background py-2 sm:hidden">
        <div className="2xl:max-w-(--breakpoint-2xl) mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-8 xl:max-w-7xl">
          <Tabs
            tabs={items
              .filter((f) => !f.hidden)
              .map((i) => {
                return { name: i.name, routePath: i.href };
              })}
            className="grow"
          />
        </div>
      </div>

      <div ref={mainElement} className="w-full overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}

function IconLink({
  name,
  href,
  icon,
  current,
  iconSelected,
  label,
  textIcon,
  textIconSelected,
}: {
  name: string;
  href: string;
  icon?: React.ReactNode;
  iconSelected?: React.ReactNode;
  current: boolean;
  label?: {
    align: "bottom" | "right";
  };
  textIcon?: string;
  textIconSelected?: string;
}) {
  return (
    <div className={clsx("w-full px-1 py-1")}>
      <Link
        href={href}
        className={clsx(
          "flex w-11 items-center justify-center rounded-md border px-2 py-2 text-xs hover:border-border hover:bg-secondary hover:text-foreground",
          current ? "border-border bg-secondary" : "border-transparent text-muted-foreground",
          !label ? "w-11" : "lg:w-auto lg:justify-start",
          label?.align === "bottom" && "flex-col space-y-1",
          label?.align === "right" && "flex-row gap-2"
        )}
      >
        {textIcon !== undefined && textIconSelected !== undefined ? (
          <div>
            {current ? (
              <EntityIcon className="h-5 w-5 text-muted-foreground" icon={textIconSelected} />
            ) : (
              <EntityIcon className="h-5 w-5 text-muted-foreground" icon={textIcon} />
            )}
          </div>
        ) : (
          <div>{current ? iconSelected : icon}</div>
        )}
        {label !== undefined && (
          <div className={clsx([icon, iconSelected, textIcon, textIconSelected].some((f) => f !== undefined) && "hidden lg:block")}>{name}</div>
        )}
      </Link>
    </div>
  );
}
