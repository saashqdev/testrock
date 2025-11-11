export interface IPortalCheckoutSessionsDb {
  getCheckoutSessionStatus(id: string): Promise<{
    id: string;
    portalId: string;
    createdAt: Date;
    updatedAt: Date;
    pending: boolean;
    email: string;
    fromUrl: string;
    fromUserId: string | null;
    createdUserId: string | null;
  } | null>;
  createCheckoutSessionStatus(data: { id: string; portalId: string; email: string; fromUrl: string; fromUserId?: string | null | undefined }): Promise<{
    id: string;
    portalId: string;
    createdAt: Date;
    updatedAt: Date;
    pending: boolean;
    email: string;
    fromUrl: string;
    fromUserId: string | null;
    createdUserId: string | null;
  }>;
  updateCheckoutSessionStatus(
    id: string,
    data: {
      pending: boolean;
      createdUserId?: string | null | undefined;
    }
  ): Promise<{
    id: string;
    portalId: string;
    createdAt: Date;
    updatedAt: Date;
    pending: boolean;
    email: string;
    fromUrl: string;
    fromUserId: string | null;
    createdUserId: string | null;
  }>;
}
