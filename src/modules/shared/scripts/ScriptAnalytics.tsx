"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CookieCategory } from "@/lib/cookies/CookieCategory";
import { useRootData } from "@/lib/state/useRootData";
import CookieHelper from "@/lib/helpers/CookieHelper";

export default function ScriptAnalytics() {
  const rootData = useRootData();
  const pathname = usePathname();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  if (!rootData.appConfiguration?.analytics.enabled) {
    return null;
  }
  if (["/app/", "/admin/"].some((p) => pathname.startsWith(p))) {
    return null;
  }
  return (
    <>
      {rootData.appConfiguration?.analytics.simpleAnalytics && (
        <>
          <script async defer src="https://scripts.simpleanalyticscdn.com/latest.js"></script>
        </>
      )}

      {rootData.appConfiguration?.analytics.plausibleAnalytics && (
        <>
          <script defer data-domain={rootData.domainName} src="https://plausible.io/js/script.js"></script>
        </>
      )}

      {CookieHelper.hasConsent(rootData.userSession, CookieCategory.ADVERTISEMENT) && (
        <>
          {rootData.appConfiguration?.analytics.googleAnalyticsTrackingId && (
            <>
              <script async src={`https://www.googletagmanager.com/gtag/js?id=${rootData.appConfiguration?.analytics.googleAnalyticsTrackingId}`} />
              <script
                async
                id="gtag-init"
                dangerouslySetInnerHTML={{
                  __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${rootData.appConfiguration?.analytics.googleAnalyticsTrackingId}', {
                  page_path: window.location.pathname,
                });
              `,
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
}
