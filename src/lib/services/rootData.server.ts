"server-only";

import { getUserInfo, getCSRFToken } from "@/lib/services/session.server";
import { defaultSiteTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getBaseURL, getDomainName } from "@/lib/services/url.server";
import i18next from "i18next";
import { RootDataDto } from "@/lib/state/useRootData";
import { db } from "@/db";
import AnalyticsService from "@/lib/helpers/server/AnalyticsService";
import { headers, cookies } from "next/headers";
import { AnalyticsInfoDto } from "@/lib/dtos/marketing/AnalyticsInfoDto";
import { generateAnalyticsUserId } from "@/utils/analyticsCookie.server";

export async function getRootData(): Promise<RootDataDto> {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await db.users.getUser(userInfo.userId) : null;
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  // Feature flags require request context, so return empty array when not available
  const featureFlags: string[] = [];
  
  // Get existing CSRF token (doesn't try to set cookie in Server Component)
  const csrf = await getCSRFToken();

  // Get analytics info if enabled
  let analytics: AnalyticsInfoDto | undefined = undefined;
  if (appConfiguration.analytics.enabled) {
    try {
      const headersList = await headers();
      const url = headersList.get("x-url") || "";
      // Create a mock request for analytics
      const request = new Request(url, {
        headers: headersList,
      });
      
      // Read existing analytics cookie (don't try to set it here - that happens in the API route)
      const cookieStore = await cookies();
      const userAnalyticsId = cookieStore.get("therock_analytics")?.value || await generateAnalyticsUserId();
      
      analytics = await AnalyticsService.getFromRequest({
        appConfiguration,
        request,
        userId: userInfo.userId ?? null,
      });
      
      // Add the userAnalyticsId to analytics
      if (analytics) {
        analytics.userAnalyticsId = userAnalyticsId;
      }
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error("[getRootData] Error getting analytics info:", e.message);
    }
  }

  return {
    metatags: {
      title: `${defaultSiteTags.title}`,
    },
    user,
    theme: {
      color: userInfo.theme || appConfiguration.app.theme.color,
      scheme: userInfo.scheme || appConfiguration.app.theme.scheme,
    },
    locale: i18next.language || "en",
    serverUrl: await getBaseURL(),
    domainName: await getDomainName(),
    userSession: userInfo,
    authenticated: !!userInfo.userId,
    debug: process.env.NODE_ENV === "development",
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    chatWebsiteId: process.env.CRISP_CHAT_WEBSITE_ID?.toString(),
    featureFlags,
    analytics,
    csrf,
    appConfiguration: {
      ...appConfiguration,
      app: {
        ...appConfiguration.app,
        theme: appConfiguration.app.theme,
      },
    },
  };
}
