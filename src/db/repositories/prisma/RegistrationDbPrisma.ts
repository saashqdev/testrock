import { prisma } from "@/db/config/prisma/database";
import { IRegistrationDb } from "@/db/interfaces/accounts/IRegistrationDb";
export class RegistrationDbPrisma implements IRegistrationDb {
  async getRegistrationByEmail(email: string) {
    return await prisma.registration.findFirst({
      where: {
        email,
      },
    });
  }

  async getRegistrationByToken(token: string) {
    return await prisma.registration.findUnique({
      where: {
        token,
      },
    });
  }

  async createRegistration(data: {
    email: string;
    firstName: string;
    lastName: string;
    token: string;
    company: string | null;
    selectedSubscriptionPriceId: string | null;
    ipAddress: string | null;
    slug: string | null;
  }) {
    return await prisma.registration.create({
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        token: data.token,
        company: data.company,
        selectedSubscriptionPriceId: data.selectedSubscriptionPriceId,
        ipAddress: data.ipAddress,
        slug: data.slug,
      },
    });
  }

  async updateRegistration(
    id: string,
    data: {
      firstName?: string;
      lastName?: string;
      company?: string | null;
      createdTenantId?: string | null;
      token?: string;
    }
  ) {
    return await prisma.registration.update({
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
