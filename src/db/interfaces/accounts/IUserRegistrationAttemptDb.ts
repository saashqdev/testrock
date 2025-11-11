import { UserRegistrationAttemptModel } from "@/db/models";

export interface IUserRegistrationAttemptDb {
  getByEmail(email: string): Promise<UserRegistrationAttemptModel | null>;
  getByToken(token: string): Promise<UserRegistrationAttemptModel | null>;
  create(data: Omit<UserRegistrationAttemptModel, "id" | "createdAt" | "updatedAt">): Promise<string>;
  update(
    id: string,
    data: {
      firstName?: string | undefined;
      lastName?: string | undefined;
      company?: string | null | undefined;
      createdTenantId?: string | null | undefined;
      token?: string | undefined;
    }
  ): Promise<void>;
}
