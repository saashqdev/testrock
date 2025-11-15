import { AnalyticsEvent, FeatureFlag, FeatureFlagFilter } from "@prisma/client";

export type FeatureFlagsModel = {
    name: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    enabled: boolean;
}

export type FeatureFlagWithDetailsDto = FeatureFlag & {
  filters: FeatureFlagFilter[];
};

export type FeatureFlagWithEventsDto = FeatureFlagWithDetailsDto & {
  events: AnalyticsEvent[];
};
