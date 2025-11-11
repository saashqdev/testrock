import { FeatureFlagWithDetailsDto, FeatureFlagWithEventsDto } from "@/db/models/featureFlags/FeatureFlagsModel";
import { FeatureFlagsFilterType } from "@/modules/featureFlags/dtos/FeatureFlagsFilterTypes";
export interface IFeatureFlagsDb {
  getFeatureFlag(where: { name?: string; id?: string; description?: string; enabled?: boolean | undefined }): Promise<FeatureFlagWithDetailsDto | null>;
  getAllFeatureFlags(): Promise<FeatureFlagWithDetailsDto[]>;
  getFeatureFlags(where: { enabled?: boolean | undefined; forcedFlags?: string[] }): Promise<FeatureFlagWithDetailsDto[]>;
  getFeatureFlagsWithEvents(where: { enabled: boolean | undefined }): Promise<FeatureFlagWithEventsDto[]>;
  createFeatureFlag(data: {
    name: string;
    description: string;
    enabled: boolean;
    filters: {
      type: FeatureFlagsFilterType;
      value: string | null;
      action?: string | null;
    }[];
  }): Promise<FeatureFlagWithDetailsDto>;
  updateFeatureFlag(
    where: { id: string },
    data: {
      name?: string;
      description?: string;
      enabled?: boolean;
      filters?: {
        type: FeatureFlagsFilterType;
        value: string | null;
        action?: string | null;
      }[];
    }
  ): Promise<FeatureFlagWithDetailsDto>;
  deleteFeatureFlag(where: { id: string }): Promise<FeatureFlagWithDetailsDto>;
}
