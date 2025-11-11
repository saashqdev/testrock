export interface ICheckoutSessionsDb {
  getCheckoutSessionStatus(id: string): Promise<{
    id: string;
    pending: boolean;
    email: string;
    fromUrl: string;
    fromUserId?: string | null;
    fromTenantId?: string | null;
    createdUserId?: string | null;
    createdTenantId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  } | null>;

  createCheckoutSessionStatus(data: { id: string; email: string; fromUrl: string; fromUserId?: string | null; fromTenantId?: string | null }): Promise<{
    id: string;
    pending: boolean;
    email: string;
    fromUrl: string;
    fromUserId?: string | null;
    fromTenantId?: string | null;
    createdUserId?: string | null;
    createdTenantId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;

  updateCheckoutSessionStatus(
    id: string,
    data: {
      pending: boolean;
      createdUserId?: string | null;
      createdTenantId?: string | null;
    }
  ): Promise<{
    id: string;
    pending: boolean;
    email: string;
    fromUrl: string;
    fromUserId?: string | null;
    fromTenantId?: string | null;
    createdUserId?: string | null;
    createdTenantId?: string | null;
    createdAt: Date;
    updatedAt: Date;
  }>;
}
