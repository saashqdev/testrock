import { ITenantTypesDb } from "@/db/interfaces/accounts/ITenantTypesDb";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { TenantTypeWithDetailsDto } from "@/db/models/accounts/TenantTypesModel";

const includeDetails = {
  subscriptionProducts: true,
  _count: { select: { tenants: true } },
};

export class TenantTypesDbPrisma implements ITenantTypesDb {
  async getAllTenantTypes(): Promise<TenantTypeWithDetailsDto[]> {
    return await prisma.tenantType.findMany({
      include: {
        subscriptionProducts: true,
        _count: { select: { tenants: true } },
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getDefaultTenantTypes() {
    return await prisma.tenantType.findMany({
      where: { isDefault: true },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getTenantType(id: string): Promise<TenantTypeWithDetailsDto | null> {
    return await prisma.tenantType.findUnique({
      where: { id: id },
      include: includeDetails,
    });
  }

  async getTenantTypeByTitle(title: string): Promise<TenantTypeWithDetailsDto | null> {
    return await prisma.tenantType.findUnique({
      where: { title },
      include: includeDetails,
    });
  }

  async createTenantType(data: { title: string; titlePlural: string; description: string | null; isDefault?: boolean; subscriptionProducts: string[] }) {
    return await prisma.tenantType.create({
      data: {
        title: data.title,
        titlePlural: data.titlePlural,
        description: data.description,
        isDefault: data.isDefault,
        subscriptionProducts: {
          connect: data.subscriptionProducts.map((id) => ({ id })),
        },
      },
    });
  }

  async updateTenantType(
    id: string,
    data: {
      title?: string;
      titlePlural?: string;
      description?: string | null;
      isDefault?: boolean;
      subscriptionProducts?: string[];
    }
  ) {
    const update: Prisma.TenantTypeUncheckedUpdateInput = {
      title: data.title,
      titlePlural: data.titlePlural,
      description: data.description,
      isDefault: data.isDefault,
    };
    if (data.subscriptionProducts) {
      update.subscriptionProducts = {
        set: data.subscriptionProducts.map((id) => ({ id })),
      };
    }
    return await prisma.tenantType.update({
      where: { id: id },
      data: update,
    });
  }

  async deleteTenantType(id: string) {
    return await prisma.tenantType.delete({
      where: { id: id },
    });
  }
}
