import { getBaseURL, getDomainName } from "@/utils/url.server";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { Prisma } from "@prisma/client";
import { defaultTheme } from "@/utils/theme/defaultThemes";
import { IAppConfigurationDb } from "@/db/interfaces/core/IAppConfigurationDb";
import { prisma } from "@/db/config/prisma/database";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";

export class AppConfigurationDbPrisma implements IAppConfigurationDb {
  async getAppConfiguration(): Promise<AppConfigurationDto> {
    const { t } = await getServerTranslations();
    const defaultEmailConfig: AppConfigurationDto["email"] = {
      provider: "postmark", // postmark, resend, or sendgrid
      fromEmail: "thedevs@NextRock.com",
      fromName: "TheDevs @ NextRock",
      supportEmail: "the.devs@NextRock.dev",
    };
    const conf: AppConfigurationDto = {
      app: {
        name: process.env.APP_NAME?.toString() ?? "",
        url: await getBaseURL(),
        domain: await getDomainName(),
        cache: "redis", // or "memory" or "redis" as appropriate
        orm: "prisma",
        theme: typeof defaultTheme === "string" ? defaultTheme : (defaultTheme as any).color ?? "",
        company: undefined,
        features: {
          tenantHome: "/app/:tenant/",
          tenantApiKeys: true,
          tenantEntityCustomization: false,
          tenantTypes: false,
          tenantBlogs: false,
          tenantWorkflows: false,
          tenantEmailMarketing: false,
          tenantFeedback: true,
          surveys: true,
        },
      },
      email: defaultEmailConfig,
      auth: {
        requireEmailVerification: false,
        requireOrganization: false,
        requireName: false,
        slug: { require: false, type: "username" },
        recaptcha: {
          enabled: false,
          siteKey: process.env.AUTH_RECAPTCHA_SITE_KEY ?? "",
        },
        authMethods: {
          emailPassword: {
            enabled: true,
          },
          github: {
            enabled: false,
            authorizationURL: (() => {
              const url = new URL("https://github.com/login/oauth/authorize");
              url.searchParams.append("client_id", process?.env.GITHUB_OAUTH_CLIENT_ID ?? "");
              url.searchParams.append("redirect_uri", getBaseURL() + "/oauth/github/callback");
              url.searchParams.append("scope", ["read:user", "user:email"].join(","));
              return url.toString();
            })(),
          },
          google: {
            enabled: false,
          },
        },
      },
      analytics: {
        enabled: true,
        googleAnalyticsTrackingId: process.env.ANALYTICS_GA_TRACKING_ID,
        simpleAnalytics: true,
        plausibleAnalytics: false,
        ipLookup: true,
      },
      subscription: {
        required: false,
        allowSubscribeBeforeSignUp: true,
        allowSignUpBeforeSubscribe: true,
        multiple: true,
      },
      cookies: {
        enabled: true,
      },
      notifications: {
        enabled: !!process.env.NOTIFICATIONS_NOVU_APP_ID && !!process.env.NOTIFICATIONS_NOVU_API_KEY,
        novuAppId: process.env.NOTIFICATIONS_NOVU_APP_ID,
      },
      onboarding: {
        enabled: true,
      },
      featureFlags: {
        enabled: true,
      },
      metrics: {
        enabled: true,
        logToConsole: false,
        saveToDatabase: false,
        ignoreUrls: ["/build", "/admin/metrics"],
      },
      branding: {
        logo: undefined,
        logoDarkMode: undefined,
        icon: undefined,
        iconDarkMode: undefined,
        favicon: undefined,
      },
      affiliates: undefined,
      // affiliates: {
      //   provider: { rewardfulApiKey: "abc123" },
      //   signUpLink: "https://myapp.getrewardful.com/",
      //   percentage: 30,
      //   plans: [
      //     { title: "Basic", price: 100 },
      //     { title: "Starter", price: 200 },
      //     { title: "Pro", price: 300 },
      //   ],
      // },
      launches: undefined,
      portals: await db.appPortalConfiguration.getAppPortalConfiguration({ t }),
      widgets: {
        ...(await db.appWidgetsConfiguration.getWidgetsConfiguration({ t })),
        chatWidget: {
          enabled: false,
          provider: "tawkto",
          config: {},
        },
      },
      scripts: { head: null, body: null },
    };

    const appConfiguration = await cachified({
      key: `appConfiguration`,
      ttl: 1000 * 60 * 60 * 24, // 1 day
      getFreshValue: async () => prisma.appConfiguration.findFirst(),
    });
    if (!appConfiguration) {
      return conf;
    }
    conf.app.name = appConfiguration?.name ?? "";
    // conf.app.url = appConfiguration?.url ?? "";
    conf.app.theme =
      typeof appConfiguration?.theme === "string"
        ? appConfiguration.theme
        : typeof defaultTheme === "string"
          ? defaultTheme
          : (defaultTheme as any).color ?? "";

    conf.email.provider = (appConfiguration?.emailProvider ?? defaultEmailConfig.provider) as AppConfigurationDto["email"]["provider"];
    conf.email.fromEmail = appConfiguration?.emailFromEmail ?? defaultEmailConfig.fromEmail;
    conf.email.fromName = appConfiguration?.emailFromName ?? defaultEmailConfig.fromName;
    conf.email.supportEmail = appConfiguration?.emailSupportEmail ?? defaultEmailConfig.supportEmail;

    conf.auth.requireEmailVerification = appConfiguration?.authRequireEmailVerification;
    conf.auth.requireOrganization = appConfiguration?.authRequireOrganization;
    conf.auth.requireName = appConfiguration?.authRequireName;
    conf.auth.recaptcha.enabled = false;
    conf.auth.recaptcha.siteKey = appConfiguration.authRecaptchaSiteKey ?? "";
    if (appConfiguration.authRecaptchaSiteKey) {
      conf.auth.recaptcha.enabled = true;
    }

    conf.analytics.enabled = appConfiguration?.analyticsEnabled;
    conf.analytics.simpleAnalytics = appConfiguration?.analyticsSimpleAnalytics;
    conf.analytics.plausibleAnalytics = appConfiguration?.analyticsPlausibleAnalytics;
    conf.analytics.googleAnalyticsTrackingId = appConfiguration?.analyticsGoogleAnalyticsTrackingId ?? undefined;

    conf.subscription.required = appConfiguration?.subscriptionRequired;
    conf.subscription.allowSubscribeBeforeSignUp = appConfiguration?.subscriptionAllowSubscribeBeforeSignUp;
    conf.subscription.allowSignUpBeforeSubscribe = appConfiguration?.subscriptionAllowSignUpBeforeSubscribe;

    conf.cookies.enabled = appConfiguration?.cookiesEnabled;

    conf.metrics.enabled = appConfiguration?.metricsEnabled;
    conf.metrics.logToConsole = appConfiguration?.metricsLogToConsole;
    conf.metrics.saveToDatabase = appConfiguration?.metricsSaveToDatabase;
    conf.metrics.ignoreUrls = appConfiguration?.metricsIgnoreUrls?.split(",") ?? [];

    conf.branding.logo = appConfiguration?.brandingLogo ?? undefined;
    conf.branding.logoDarkMode = appConfiguration?.brandingLogoDarkMode ?? undefined;
    conf.branding.icon = appConfiguration?.brandingIcon ?? undefined;
    conf.branding.iconDarkMode = appConfiguration?.brandingIconDarkMode ?? undefined;
    conf.branding.favicon = appConfiguration?.brandingFavicon ?? undefined;

    conf.scripts = {
      head: appConfiguration?.headScripts || null,
      body: appConfiguration?.bodyScripts || null,
    };

    return conf;
  }

  async getOrCreateAppConfiguration() {
    let settings = await prisma.appConfiguration.findFirst();
    if (!settings) {
      const conf = await this.getAppConfiguration();
      settings = await prisma.appConfiguration
        .create({
          data: {
            name: conf.app.name,
            url: conf.app.url,
            authRequireEmailVerification: conf.auth.requireEmailVerification,
            authRequireOrganization: conf.auth.requireOrganization,
            authRequireName: conf.auth.requireName,
            authRecaptchaSiteKey: conf.auth.recaptcha.siteKey,
            analyticsEnabled: conf.analytics.enabled,
            analyticsSimpleAnalytics: conf.analytics.simpleAnalytics,
            analyticsPlausibleAnalytics: conf.analytics.plausibleAnalytics,
            analyticsGoogleAnalyticsTrackingId: conf.analytics.googleAnalyticsTrackingId,
            subscriptionRequired: conf.subscription.required,
            subscriptionAllowSubscribeBeforeSignUp: conf.subscription.allowSubscribeBeforeSignUp,
            subscriptionAllowSignUpBeforeSubscribe: conf.subscription.allowSignUpBeforeSubscribe,
            cookiesEnabled: conf.cookies.enabled,
            metricsEnabled: conf.metrics.enabled,
            metricsLogToConsole: conf.metrics.logToConsole,
            metricsSaveToDatabase: conf.metrics.saveToDatabase,
            metricsIgnoreUrls: conf.metrics.ignoreUrls.join(","),
            brandingLogo: conf.branding.logo,
            brandingLogoDarkMode: conf.branding.logoDarkMode,
            brandingIcon: conf.branding.icon,
            brandingIconDarkMode: conf.branding.iconDarkMode,
            brandingFavicon: conf.branding.favicon,
          },
        })
        .then((item) => {
          clearCacheKey(`appConfiguration`);
          return item;
        });
    }
    return settings;
  }

  async updateAppConfiguration(data: Prisma.AppConfigurationUpdateInput) {
    return await prisma.appConfiguration
      .updateMany({
        data,
      })
      .then((item) => {
        clearCacheKey(`appConfiguration`);
        return item;
      });
  }

  async deleteAppConfiguration() {
    return await prisma.appConfiguration.deleteMany({ where: {} }).then((item) => {
      clearCacheKey(`appConfiguration`);
      return item;
    });
  }
}
