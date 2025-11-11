import { SubscriptionFeatureLimitType } from "@/modules/subscriptions/enums/SubscriptionFeatureLimitType";
import { SubscriptionFeatureModel } from "@/db/models/subscriptions/SubscriptionFeatureModel";

export interface ISubscriptionFeatureDb {
  getAll(): Promise<SubscriptionFeatureModel[]>;
  get(id: string): Promise<SubscriptionFeatureModel | null>;
  create(
    subscriptionProductId: string,
    data: {
      order: number;
      title: string;
      name: string;
      type: SubscriptionFeatureLimitType;
      value: number;
      href?: string | null;
      badge?: string | null;
      accumulate?: boolean;
    }
  ): Promise<string>;
  deleteBySubscriptionProductId(subscriptionProductId: string): Promise<void>;
}
