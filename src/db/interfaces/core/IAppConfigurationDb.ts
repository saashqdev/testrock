import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { Prisma } from "@prisma/client";

export interface IAppConfigurationDb {
  getAppConfiguration(): Promise<AppConfigurationDto>;
  getOrCreateAppConfiguration(): Promise<{
    id: string;
    url: string;
    name: string;
    updatedAt: Date;
    authRequireEmailVerification: boolean;
    authRequireOrganization: boolean;
    authRequireName: boolean;
    analyticsSimpleAnalytics: boolean;
    analyticsPlausibleAnalytics: boolean;
    analyticsGoogleAnalyticsTrackingId: string | null;
    brandingLogo: string | null;
    brandingLogoDarkMode: string | null;
    brandingIcon: string | null;
    brandingIconDarkMode: string | null;
    brandingFavicon: string | null;
    theme: string | null;
    authRecaptchaSiteKey: string | null;
    emailSupportEmail: string | null;
  } | null>;
  updateAppConfiguration(data: Prisma.AppConfigurationUpdateInput): Promise<Prisma.BatchPayload>;
  deleteAppConfiguration(): Promise<Prisma.BatchPayload>;
}
