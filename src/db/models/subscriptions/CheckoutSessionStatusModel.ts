export type CheckoutSessionStatusModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  pending: boolean;
  email: string;
  fromUrl: string;
  fromUserId: string | null;
  fromTenantId: string | null;
  createdUserId: string | null;
  createdTenantId: string | null;
};
