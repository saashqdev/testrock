export type SubscriptionFeatureModel = {
  id: string;
  subscriptionProductId: string;
  order: number;
  title: string;
  name: string;
  type: number;
  value: number;
  href: string | null;
  badge: string | null;
  accumulate: boolean;
};
