import { IPageMetaTagsDb } from "@/db/interfaces/pageBlocks/IPageMetaTagsDb";
import { prisma } from "@/db/config/prisma/database";
import { clearCacheKey } from "@/lib/services/cache.server";

export class PageMetaTagsDbPrisma implements IPageMetaTagsDb {
  async getMetaTags(pageId: string | null) {
    return await prisma.pageMetaTag
      .findMany({
        where: { pageId },
        orderBy: { order: "asc" },
      })
      .catch(() => {
        return [];
      });
  }

  async createMetaTag(data: { pageId: string | null; name: string; value: string; order: number }) {
    return await prisma.pageMetaTag
      .create({
        data,
        include: { page: true },
      })
      .then((item) => {
        clearCacheKey(`page:${item.page?.slug}`);
        clearCacheKey(`pageMetaTags:${item.page?.slug}`);
        return item;
      });
  }

  async updateMetaTag(id: string, data: { value: string; order: number }) {
    return await prisma.pageMetaTag
      .update({
        where: { id },
        data,
        include: { page: true },
      })
      .then((item) => {
        clearCacheKey(`page:${item.page?.slug}`);
        clearCacheKey(`pageMetaTags:${item.page?.slug}`);
        return item;
      });
  }

  async deleteMetaTags(page: { id: string; slug: string } | null) {
    return await prisma.pageMetaTag.deleteMany({ where: { pageId: page?.id || null } }).then((item) => {
      clearCacheKey(`page:${page?.slug}`);
      clearCacheKey(`pageMetaTags:${page?.slug}`);
      return item;
    });
  }
}
