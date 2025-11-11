import { IIpAddressLogsDb } from "@/db/interfaces/ipAddresses/IIpAddressLogsDb";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import * as Constants from "@/lib/constants";
import { prisma } from "@/db/config/prisma/database";
import { IpAddressLogWithDetailsDto } from "@/db/models/ipAddresses/IpAddressLogsModel";
export class IpAddressLogsDbPrisma implements IIpAddressLogsDb {
  async getAllIpAddressLogs(pagination?: { page: number; pageSize: number }): Promise<{ items: IpAddressLogWithDetailsDto[]; pagination: PaginationDto }> {
    const items = await prisma.ipAddressLog.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      orderBy: [{ createdAt: "desc" }],
    });
    const totalItems = await prisma.ipAddressLog.count({});

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
