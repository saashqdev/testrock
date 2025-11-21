"use client";

import { ReactNode, useContext } from "react";
import { Action, KBarAnimator, KBarPortal, KBarPositioner, KBarProvider, KBarResults, KBarSearch, useMatches } from "kbar";
import { useTranslation } from "react-i18next";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import UserGroupIconFilled from "../icons/UserGroupIconFilled";
import AdminCommandHelper from "@/lib/helpers/commands/AdminCommandHelper";
import AppCommandHelper from "@/lib/helpers/commands/AppCommandHelper";
import DocsCommandHelper from "@/lib/helpers/commands/DocsCommandHelper";
import { AppDataContext } from "@/lib/state/useAppData";
import { useRootData } from "@/lib/state/useRootData";

interface Props {
  layout?: "app" | "admin" | "docs";
  children: ReactNode;
  actions?: Action[];
}

export default function CommandPalette({ layout, children, actions }: Props) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const router = useRouter();
  
  // Always call hooks unconditionally at the top level
  // Use useContext directly to avoid throwing errors when provider is not available
  const appData = useContext(AppDataContext);

  if (layout === "app" && appData) {
    actions = AppCommandHelper.getCommands({ t, router, appData, rootData });
  } else if (layout === "admin") {
    actions = AdminCommandHelper.getCommands({ t, router, rootData });
  } else if (layout === "docs") {
    actions = DocsCommandHelper.getCommands({ t, router });
  }

  return (
    <KBarProvider
      actions={actions?.map((i) => {
        return {
          ...i,
          icon: <UserGroupIconFilled className="" />,
        };
      })}
    >
      <CommandBar />
      {children}
    </KBarProvider>
  );
}

function CommandBar() {
  return (
    <KBarPortal>
      <KBarPositioner className="text-foreground bg-foreground/80 dark:bg-background/60 z-50 flex items-center p-2">
        <KBarAnimator className="bg-background w-full max-w-lg overflow-hidden rounded-xl">
          <KBarSearch className="bg-background text-foreground flex w-full border-0 p-4 outline-hidden focus:outline-hidden" />
          <RenderResults />
        </KBarAnimator>
      </KBarPositioner>
    </KBarPortal>
  );
}

function RenderResults() {
  const { results } = useMatches();

  return (
    <KBarResults
      items={results}
      onRender={({ item, active }) =>
        typeof item === "string" ? (
          <div className={clsx("flex w-full cursor-pointer items-center space-x-3 py-4 pl-4 pr-5", active ? "bg-secondary/90" : "")}>
            <div className="text-foreground/80 text-sm font-medium">{item}</div>
          </div>
        ) : (
          <div className={clsx("flex w-full cursor-pointer items-center space-x-3 py-4 pl-4 pr-5", active ? "bg-secondary/90" : "")}>
            {/* {item.icon && <div className="h-10 w-10 p-2">{item.icon}</div>} */}
            <div className="flex w-full items-center justify-between space-x-2">
              <div className="text-foreground/80 text-sm font-medium">{item.name}</div>
              <div className="text-muted-foreground truncate text-xs">{item.subtitle}</div>
            </div>
          </div>
        )
      }
    />
  );
}
