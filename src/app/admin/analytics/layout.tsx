"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import UrlUtils from "@/utils/app/UrlUtils";

export default function AdminAnalyticsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(pathname) === "/admin/analytics") {
      router.push("/admin/analytics/overview");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return <>{children}</>;
}
