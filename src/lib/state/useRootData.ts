"use client";

import { UserWithoutPasswordDto } from "@/db/models";
import { MetaTagsDto } from "@/lib/dtos/MetaTagsDto";
import type { UserSession } from "@/lib/services/session.server";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { AnalyticsInfoDto } from "@/lib/dtos/marketing/AnalyticsInfoDto";
import { createContext, useContext } from "react";

export type RootDataDto = {
  metatags: MetaTagsDto;
  user: UserWithoutPasswordDto | null;
  theme: { color: string; scheme: string };
  locale: string;
  serverUrl: string;
  domainName: string;
  userSession: UserSession;
  authenticated: boolean;
  debug: boolean;
  isStripeTest: boolean;
  chatWebsiteId?: string;
  appConfiguration: AppConfigurationDto;
  csrf?: string;
  featureFlags: string[];
  analytics?: AnalyticsInfoDto;
};

export const RootDataContext = createContext<RootDataDto | null>(null);

export function useRootData(): RootDataDto {
  const context = useContext(RootDataContext);

  if (typeof window === "undefined") {
    // During SSR, return a minimal default value to prevent context errors
    return {
      appConfiguration: {
        onboarding: { enabled: false },
        notifications: { enabled: false },
        app: { features: {} },
        auth: { authMethods: { emailPassword: { enabled: true }, github: { enabled: false }, google: { enabled: false } } },
        subscription: { allowSignUpBeforeSubscribe: true },
      },
    } as RootDataDto;
  }

  if (!context) {
    throw new Error("useRootData must be used within a RootDataContext.Provider");
  }
  return context;
}

// Default export for consistency
export default useRootData;
