import { CheckoutSessionStatusModel } from "@/db/models/subscriptions/CheckoutSessionStatusModel";

export interface ICheckoutSessionStatusDb {
  get(id: string): Promise<CheckoutSessionStatusModel | null>;
  create(data: {
    id: string;
    email: string;
    fromUrl: string;
    fromUserId?: string | null | undefined;
    fromTenantId?: string | null | undefined;
  }): Promise<string>;
  update(
    id: string,
    data: {
      pending: boolean;
      createdUserId?: string | null | undefined;
      createdTenantId?: string | null | undefined;
    }
  ): Promise<void>;
}
