import { IIpAddressesDb } from "@/db/interfaces/ipAddresses/IIpAddressesDb";
import { IpAddress } from "@prisma/client";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import * as Constants from "@/lib/constants";
import { prisma } from "@/db/config/prisma/database";

export class IpAddressesDbPrisma implements IIpAddressesDb {
  async getAllIpAddresses(pagination?: { page: number; pageSize: number }): Promise<{ items: IpAddress[]; pagination: PaginationDto }> {
    const items = await prisma.ipAddress.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      orderBy: [{ createdAt: "desc" }],
    });
    const totalItems = await prisma.ipAddress.count({});

    return {
      items,
      pagination: {
        page: pagination?.page ?? 1,
        pageSize: pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE,
        totalItems,
        totalPages: Math.ceil(totalItems / (pagination?.pageSize ?? Constants.DEFAULT_PAGE_SIZE)),
      },
    };
  }
}
