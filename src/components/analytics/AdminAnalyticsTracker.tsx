"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useRootData } from "@/lib/state/useRootData";
import AnalyticsHelper from "@/lib/helpers/AnalyticsHelper";

/**
 * Analytics tracker for admin and app routes.
 * The main ScriptAnalytics component excludes /admin and /app routes,
 * but this component tracks page views for those authenticated areas.
 */
export default function AdminAnalyticsTracker() {
  const rootData = useRootData();
  const pathname = usePathname();

  useEffect(() => {
    // Only track if analytics is enabled
    if (!rootData.appConfiguration?.analytics.enabled) {
      return;
    }

    // Only track admin and app routes
    if (!["/app/", "/admin/"].some((p) => pathname.startsWith(p))) {
      return;
    }

    // Track the page view
    const url = window.location.href;
    const route = pathname;

    AnalyticsHelper.addPageView({
      url,
      route,
      rootData,
    }).catch((error) => {
      // Silently fail - don't break the app if analytics fails
      console.error("[AdminAnalyticsTracker]", error);
    });
  }, [pathname, rootData]);

  return null;
}
