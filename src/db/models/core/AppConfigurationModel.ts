import { AppPortalConfigurationDto } from "@/db/models/core/AppPortalConfigurationModel";
import { AppWidgetsConfigurationDto } from "@/db/models/core/AppWidgetsConfigurationModel";

export type AppConfigurationDto = {
  app: {
    name: string;
    url: string;
    domain: string;
    cache: "memory" | "redis" | null;
    orm: string;
    theme: { color: string; scheme: "light" | "dark" | "system" };
    company?: { name: string; address: string };
    features: {
      tenantHome: "/app/:tenant/" | "/";
      tenantTypes: boolean;
      tenantApiKeys?: boolean;
      tenantEntityCustomization?: boolean;
      tenantBlogs: boolean;
      tenantWorkflows: boolean;
      tenantEmailMarketing: boolean;
      tenantFeedback: boolean;
      surveys: boolean;
    };
  };
  email: {
    provider: "postmark" | "resend" | "sendgrid";
    fromEmail: string;
    fromName: string;
    supportEmail: string;
  };
  auth: {
    requireEmailVerification: boolean;
    requireOrganization: boolean;
    requireName: boolean;
    slug: { require: boolean; type: "tenant" | "username" } | null;
    recaptcha: {
      enabled: boolean;
      siteKey: string;
    };
    authMethods: {
      emailPassword: {
        enabled: boolean;
      };
      github: {
        enabled: boolean;
        authorizationURL: string;
      };
      google: {
        enabled: boolean;
      };
    };
  };
  analytics: {
    enabled: boolean;
    simpleAnalytics: boolean;
    plausibleAnalytics: boolean;
    googleAnalyticsTrackingId?: string;
    ipLookup?: boolean;
  };
  subscription: {
    required: boolean;
    allowSubscribeBeforeSignUp: boolean;
    allowSignUpBeforeSubscribe: boolean;
    multiple: boolean;
  };
  cookies: {
    enabled: boolean;
  };
  notifications: {
    enabled: boolean;
    novuAppId?: string;
  };
  onboarding: {
    enabled: boolean;
  };
  featureFlags: {
    enabled: boolean; // load all flags
  };
  metrics: {
    enabled: boolean;
    logToConsole: boolean;
    saveToDatabase: boolean;
    ignoreUrls: string[];
  };
  branding: {
    logo?: string;
    logoDarkMode?: string;
    icon?: string;
    iconDarkMode?: string;
    favicon?: string;
  };
  affiliates?: {
    provider: { rewardfulApiKey: string };
    signUpLink: string;
    percentage: number;
    plans: { title: string; price: number }[];
  };
  reviews?: {
    trustpilot?: { href: string; templateId: string; businessUnitId: string };
  };
  launches?: {
    producthunt?: { title: string; url: string; postId: string; theme?: "light" | "neutral" | "dark"; start?: string; end?: string };
  };
  portals: AppPortalConfigurationDto & { default: { enabled: boolean; path: string; title: string } };
  widgets: AppWidgetsConfigurationDto & { chatWidget: { enabled: false; provider: "tawkto"; config: {} } };
  scripts: { head: string | null; body: string | null };
};
