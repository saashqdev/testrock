import { IBlacklistDb } from "@/db/interfaces/accounts/IBlacklistDb";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { prisma } from "@/db/config/prisma/database";
import { Blacklist } from "@prisma/client";
import * as Constants from "@/lib/constants";
export class BlacklistDbPrisma implements IBlacklistDb {
  async getBlacklist(filters?: FiltersDto, pagination?: { page: number; pageSize: number }): Promise<{ items: Blacklist[]; pagination: PaginationDto }> {
    const items = await prisma.blacklist.findMany({
      skip: pagination ? pagination?.pageSize * (pagination?.page - 1) : undefined,
      take: pagination ? pagination?.pageSize : undefined,
      orderBy: [{ registerAttempts: "desc" }, { createdAt: "desc" }],
    });
    const totalItems = await prisma.blacklist.count({});

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

  async findInBlacklist(type: string, value: string): Promise<Blacklist | null> {
    return await prisma.blacklist.findFirst({
      where: {
        type,
        value,
      },
    });
  }

  async addBlacklistAttempt(item: Blacklist) {
    // eslint-disable-next-line no-console
    console.log(`[BLACKLISTED ${item.type.toUpperCase()}]`, { type: item.type, value: item.value, registerAttempts: item.registerAttempts + 1 });
    return await prisma.blacklist.updateMany({
      where: {
        type: item.type,
        value: item.value,
      },
      data: {
        registerAttempts: item.registerAttempts + 1,
      },
    });
  }

  async addToBlacklist(data: { type: string; value: string }) {
    return await prisma.blacklist.create({
      data,
    });
  }

  async deleteFromBlacklist(where: { type: string; value: string }) {
    return await prisma.blacklist.deleteMany({
      where,
    });
  }
}
