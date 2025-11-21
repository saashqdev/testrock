import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";

// Determine cache strategy based on environment
// In production without REDIS_URL, disable cache to prevent failures
const getCacheStrategy = (): "memory" | "redis" | null => {
  if (process.env.CACHE_TYPE) {
    const cacheType = process.env.CACHE_TYPE;
    if (cacheType === "null") return null;
    if (cacheType === "memory" || cacheType === "redis") return cacheType;
    return null; // Invalid value defaults to null
  }
  // Auto-detect: use redis only if REDIS_URL is set
  if (process.env.REDIS_URL) {
    return "redis";
  }
  // Default to null (no caching) to prevent issues
  return null;
};

export const defaultAppConfiguration: AppConfigurationDto = {
  app: {
    name: "Next.js TheRock Demo",
    url: "http://localhost:3000",
    orm: "prisma",
    domain: "",
    cache: getCacheStrategy(), // memory | redis | null - auto-detected based on REDIS_URL
    theme: { color: "blue", scheme: "system" },
    company: { name: "", address: "" },
    features: {
      tenantHome: "/app/:tenant/",
      tenantTypes: false,
      surveys: false,
      tenantApiKeys: true,
      tenantEntityCustomization: false,
      tenantBlogs: false,
      tenantWorkflows: false,
      tenantEmailMarketing: false,
      tenantFeedback: false,
    },
  },
  email: {
    provider: "postmark",
    fromEmail: "thedevs@therock.dev",
    fromName: "TheDevs @ TheRock",
    supportEmail: "catstack.dev@gmail.com",
  },
  auth: {
    requireEmailVerification: false,
    requireOrganization: true,
    requireName: true,
    slug: null,
    recaptcha: { enabled: false, siteKey: "" },
    authMethods: {
      emailPassword: { enabled: true },
      github: { enabled: false, authorizationURL: "" },
      google: { enabled: false },
    },
  },
  analytics: {
    enabled: true,
    googleAnalyticsTrackingId: "",
    simpleAnalytics: true,
    plausibleAnalytics: false,
    ipLookup: false,
  },
  subscription: {
    required: false,
    allowSubscribeBeforeSignUp: true,
    allowSignUpBeforeSubscribe: true,
    multiple: false,
  },
  cookies: { enabled: true },
  notifications: {
    enabled: false,
    novuAppId: "",
  },
  onboarding: {
    enabled: true,
  },
  featureFlags: {
    enabled: true,
  },
  metrics: {
    enabled: true,
    logToConsole: true,
    saveToDatabase: false,
    ignoreUrls: ["/metrics", "/health", "/ping"],
  },
  branding: {
    logo: undefined,
    logoDarkMode: undefined,
    icon: undefined,
    iconDarkMode: undefined,
    favicon: undefined,
  },
  affiliates: undefined,
  reviews: undefined,
  launches: {
    producthunt: {
      url: "https://www.producthunt.com/posts/catstack?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-catstack",
      title: "TheRock",
      postId: "491901",
      theme: "neutral",
    },
  },
  scripts: { head: null, body: null },
  portals: {
    enabled: false,
    forTenants: false,
    pricing: false,
    analytics: false,
    metadata: undefined,
    pages: [],
    default: { enabled: false, path: "/portal", title: "Portal" },
  },
  widgets: {
    enabled: false,
    metadata: undefined,
    chatWidget: { enabled: false, provider: "tawkto", config: {} },
  },
};
