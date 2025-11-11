export interface IRegistrationDb {
  getRegistrationByEmail(email: string): Promise<{
    id: string;
    createdAt: Date;
    slug: string | null;
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    ipAddress: string | null;
    company: string | null;
    selectedSubscriptionPriceId: string | null;
    createdTenantId: string | null;
  } | null>;
  getRegistrationByToken(token: string): Promise<{
    id: string;
    createdAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    slug: string | null;
    token: string;
    ipAddress: string | null;
    company: string | null;
    selectedSubscriptionPriceId: string | null;
    createdTenantId: string | null;
  } | null>;
  createRegistration(data: {
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    company: string | null;
    selectedSubscriptionPriceId: string | null;
    ipAddress: string | null;
    slug: string | null;
  }): Promise<{
    id: string;
    createdAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    slug: string | null;
    token: string;
    ipAddress: string | null;
    company: string | null;
    selectedSubscriptionPriceId: string | null;
    createdTenantId: string | null;
  }>;
  updateRegistration(
    id: string,
    data: {
      firstName?: string | undefined;
      lastName?: string | undefined;
      company?: string | null | undefined;
      createdTenantId?: string | null | undefined;
      token?: string | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    email: string;
    firstName: string;
    lastName: string;
    slug: string | null;
    token: string;
    ipAddress: string | null;
    company: string | null;
    selectedSubscriptionPriceId: string | null;
    createdTenantId: string | null;
  }>;
}
