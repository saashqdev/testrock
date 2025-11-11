export type UserRegistrationAttemptModel = {
  id: string;
  createdAt: Date;
  email: string;
  firstName: string;
  lastName: string;
  slug: string | null;
  token: string;
  ipAddress: string | null;
  company: string | null;
  createdTenantId: string | null;
};
