import { prisma } from "@/db/config/prisma/database";
import { IUserRegistrationAttemptDb } from "@/db/interfaces/accounts/IUserRegistrationAttemptDb";
import { UserRegistrationAttemptModel } from "@/db/models";

export class UserRegistrationAttemptDbPrisma implements IUserRegistrationAttemptDb {
  async getByEmail(email: string): Promise<UserRegistrationAttemptModel | null> {
    return await prisma.userRegistrationAttempt.findFirst({
      where: {
        email,
      },
    });
  }

  async getByToken(token: string): Promise<UserRegistrationAttemptModel | null> {
    return await prisma.userRegistrationAttempt.findUnique({
      where: {
        token,
      },
    });
  }

  async create(data: Omit<UserRegistrationAttemptModel, "id" | "createdAt" | "updatedAt">): Promise<string> {
    const item = await prisma.userRegistrationAttempt.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        token: data.token,
        company: data.company,
        ipAddress: data.ipAddress,
        slug: data.slug,
      },
    });
    return item.id;
  }

  async update(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      company?: string | null;
      createdTenantId?: string | null;
      token?: string;
    }
  ): Promise<void> {
    await prisma.userRegistrationAttempt.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        company: data.company,
        createdTenantId: data.createdTenantId,
        token: data.token,
      },
    });
  }
}
