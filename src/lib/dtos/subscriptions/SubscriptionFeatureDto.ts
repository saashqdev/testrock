import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";

export interface SubscriptionFeatureDto {
  id?: string;
  order: number;
  title: string;
  name: string;
  type: SubscriptionFeatureLimitType;
  value: number;
  href?: string | null;
  badge?: string | null;
  accumulate?: boolean;
}
