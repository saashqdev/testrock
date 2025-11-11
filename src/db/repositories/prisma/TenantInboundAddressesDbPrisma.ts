import { ITenantInboundAddressesDb } from "@/db/interfaces/accounts/ITenantInboundAddressesDb";
import { prisma } from "@/db/config/prisma/database";

export class TenantInboundAddressesDbPrisma implements ITenantInboundAddressesDb {
  async getTenantInboundAddress(addresses: string[]) {
    return await prisma.tenantInboundAddress.findMany({
      where: {
        address: {
          in: addresses,
        },
      },
    });
  }

  async getTenantInboundAddressById(id: string) {
    return await prisma.tenantInboundAddress.findUnique({
      where: {
        id,
      },
    });
  }
}
