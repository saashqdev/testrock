"use client";

import { usePathname } from "next/navigation";
import { Fragment, ReactNode, useEffect } from "react";
import { useRootData } from "@/lib/state/useRootData";
import AnalyticsHelper from "@/lib/helpers/AnalyticsHelper";

interface Props {
  flag: string;
  children: ReactNode;
}
export default function FeatureFlagTracker({ flag, children }: Props) {
  let pathname = usePathname();
  const rootData = useRootData();

  useEffect(() => {
    async function track() {
      AnalyticsHelper.addEvent({
        url: pathname,
        route: pathname, // In App Router, we'll use pathname as route ID
        rootData: {
          userSession: rootData.userSession,
          appConfiguration: {
            ...rootData.appConfiguration,
            app: {
              ...rootData.appConfiguration.app,
              theme: typeof rootData.appConfiguration.app.theme === 'string' 
                ? { color: rootData.appConfiguration.app.theme, scheme: "system" as const }
                : rootData.appConfiguration.app.theme
            }
          },
        },
        action: flag,
        category: "featureFlag",
        label: "",
        value: "",
      });
    }

    if (rootData?.featureFlags.includes(flag)) {
      track();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flag]);

  return <Fragment>{children}</Fragment>;
}
