"server-only";

import { getUserInfo } from "@/lib/services/session.server";
import { defaultSiteTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getBaseURL, getDomainName } from "@/lib/services/url.server";
import i18next from "i18next";
import { RootDataDto } from "@/lib/state/useRootData";
import { db } from "@/db";;

export async function getRootData( ): Promise<RootDataDto> {
  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await db.users.getUser(userInfo.userId) : null;
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  // Feature flags require request context, so return empty array when not available
  const featureFlags: string[] = [];

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
    appConfiguration: {
      ...appConfiguration,
      app: {
        ...appConfiguration.app,
        theme: appConfiguration.app.theme,
      },
    },
  };
}
