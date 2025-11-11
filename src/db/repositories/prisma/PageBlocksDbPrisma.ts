import { IPageBlocksDb } from "@/db/interfaces/pageBlocks/IPageBlocksDb";
import { prisma } from "@/db/config/prisma/database";
import { clearCacheKey } from "@/lib/services/cache.server";

export class PageBlocksDbPrisma implements IPageBlocksDb {
  async getPageBlocks(slug: string) {
    return await prisma.pageBlock.findMany({
      where: {
        page: {
          slug,
        },
      },
      orderBy: [{ order: "asc" }],
    });
  }

  async getPageBlock(id: string) {
    return await prisma.pageBlock.findUnique({
      where: {
        id,
      },
    });
  }

  async createPageBlock(data: { pageId: string; order: number; type: string; value: string }) {
    return await prisma.pageBlock
      .create({
        data,
        include: { page: true },
      })
      .then((item) => {
        clearCacheKey(`page:${item.page.slug}`);
        return item;
      });
  }

  async updatePageBlock(id: string, data: { order: number; type: string; value: string }) {
    return await prisma.pageBlock
      .update({
        where: {
          id,
        },
        data,
        include: { page: true },
      })
      .then((item) => {
        clearCacheKey(`page:${item.page.slug}`);
        return item;
      });
  }

  async deletePageBlock(id: string) {
    return await prisma.pageBlock
      .delete({
        where: {
          id,
        },
        include: { page: true },
      })
      .then((item) => {
        clearCacheKey(`page:${item.page.slug}`);
        return item;
      });
  }

  async deletePageBlocks(page: { id: string; slug: string }) {
    return await prisma.pageBlock
      .deleteMany({
        where: {
          page: {
            id: page.id,
          },
        },
      })
      .then((item) => {
        clearCacheKey(`page:${page.slug}`);
        return item;
      });
  }
}
