import { Params } from "@/types";
import { ImpersonatingSessionDto } from "@/lib/dtos/session/ImpersonatingSessionDto";
import { getServerTranslations, detectLanguage } from "@/i18n/server";
import { createMetrics } from "@/modules/metrics/services/server/MetricTracker";
import { getAnalyticsSession, generateAnalyticsUserId, commitAnalyticsSession } from "@/utils/analyticsCookie.server";
import { promiseHash } from "@/utils/promises/promiseHash";
import { getUserInfo, getUserSession, generateCSRFToken, createUserSession } from "@/lib/services/session.server";
import { getBaseURL, getDomainName } from "@/utils/url.server";
import { RootDataDto } from "@/lib/state/useRootData";
import { AnalyticsInfoDto } from "@/lib/dtos/marketing/AnalyticsInfoDto";
import AnalyticsService from "@/lib/helpers/server/AnalyticsService";
import FeatureFlagsService from "@/modules/featureFlags/services/FeatureFlagsService";
import { db } from "@/db";

export async function loadRootData({ request, params }: { request: Request; params: Params }) {
  const { time, getServerTimingHeader } = await createMetrics({ request, params }, "root");
  const { t } = await getServerTranslations();
  const { userInfo, session, analyticsSession } = await time(
    promiseHash({
      userInfo: getUserInfo(),
      session: getUserSession(),
      analyticsSession: getAnalyticsSession(request),
    }),
    "loadRootData.session"
  );
  const user = userInfo.userId ? await db.users.getUser(userInfo.userId) : null;
  // normalize tenant id values (params and user.defaultTenantId can be string | string[])
  const tenantParam = params.tenant ? (Array.isArray(params.tenant) ? params.tenant[0] : params.tenant) : undefined;
  const defaultTenantId = user?.defaultTenantId ? (Array.isArray(user.defaultTenantId) ? user.defaultTenantId[0] : user.defaultTenantId) : undefined;
  const currentTenant = tenantParam ? await db.tenants.getTenant(tenantParam) : defaultTenantId ? await db.tenants.getTenant(defaultTenantId) : null;

  const csrf = await generateCSRFToken();
  // CSRF token is handled through cookies in the session system

  let analytics: AnalyticsInfoDto | undefined = undefined;
  const appConfiguration = await time(db.appConfiguration.getAppConfiguration(), "getAppConfiguration");
  if (appConfiguration.analytics.enabled) {
    try {
      analytics = await AnalyticsService.getFromRequest({ 
        appConfiguration: appConfiguration as any, // Type casting to resolve incompatible types
        request, 
        userId: userInfo.userId ?? null 
      });
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
    }
  }

  const headers = new Headers();
  let userAnalyticsId = analyticsSession.get("userAnalyticsId")?.value;
  // Session changes will be handled through the session service
  // if (CookieHelper.hasConsent(userInfo, CookieCategory.ANALYTICS)) {
  if (!userAnalyticsId) {
    userAnalyticsId = await generateAnalyticsUserId();
    analyticsSession.set("userAnalyticsId", userAnalyticsId);
  }
  // Commit analytics session through cookie store
  // headers.append("Set-Cookie", await commitAnalyticsSession(analyticsSession));
  // } else {
  //   headers.append("Set-Cookie", await destroyAnalyticsSession(analyticsSession));
  // }

  let impersonatingSession: ImpersonatingSessionDto | null = null;
  if (userInfo.impersonatingFromUserId && userInfo.userId?.length > 0) {
    const fromUser = await db.users.getUser(userInfo.impersonatingFromUserId);
    const toUser = await db.users.getUser(userInfo.userId);
    if (fromUser && toUser) {
      impersonatingSession = { fromUser, toUser };
    }
  }

  const locale = await detectLanguage();
  const data: RootDataDto = {
    metatags: { title: `${process.env.APP_NAME}` },
    user,
    locale,
    theme: typeof userInfo.theme === 'string' 
      ? { color: userInfo.theme, scheme: userInfo.scheme || 'light' } 
      : userInfo.theme || (typeof appConfiguration.app.theme === 'string' 
        ? { color: appConfiguration.app.theme, scheme: userInfo.scheme || 'light' } 
        : { ...appConfiguration.app.theme, scheme: userInfo.scheme || appConfiguration.app.theme.scheme || 'light' }),
    serverUrl: await getBaseURL(),
    domainName: await getDomainName(),
    userSession: userInfo,
    authenticated: userInfo.userId?.length > 0,
    debug: process.env.NODE_ENV === "development",
    isStripeTest: process.env.STRIPE_SK?.toString().startsWith("sk_test_") ?? true,
    chatWebsiteId: process.env.CRISP_CHAT_WEBSITE_ID?.toString(),
    appConfiguration,
    csrf, // Add the CSRF token to the data sent to the client
    featureFlags: appConfiguration.featureFlags.enabled ? await FeatureFlagsService.getCurrentFeatureFlags({ request, params, userAnalyticsId }) : [],
  };

  const updateMetrics = userInfo.userId?.length > 0 && appConfiguration.metrics.enabled !== userInfo.metrics?.enabled;
  const needsToUpdateSession = updateMetrics;
  if (needsToUpdateSession) {
    return createUserSession(
      {
        ...userInfo,
        metrics: appConfiguration.metrics,
      },
      new URL(request.url).pathname + new URL(request.url).search
    );
  }

  headers.append("Server-Timing", getServerTimingHeader()["Server-Timing"]);
  // Language cookie is handled through Next.js i18n system
  return Response.json(data, { headers });
}
