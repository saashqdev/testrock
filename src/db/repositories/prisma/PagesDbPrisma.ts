import { IPagesDb } from "@/db/interfaces/pageBlocks/IPagesDb";
import { prisma } from "@/db/config/prisma/database";
import { clearCacheKey } from "@/lib/services/cache.server";
import { Page } from "@prisma/client";
import { PageWithDetailsDto } from "@/db/models/pageBlocks/PagesModel";
export class PagesDbPrisma implements IPagesDb {
  async getPages(): Promise<PageWithDetailsDto[]> {
    return await prisma.page.findMany({
      include: {
        metaTags: true,
        blocks: {
          orderBy: [{ order: "asc" }],
        },
      },
      orderBy: [{ createdAt: "asc" }],
    });
  }

  async getPage(id: string): Promise<PageWithDetailsDto | null> {
    return await prisma.page.findUnique({
      where: {
        id,
      },
      include: {
        metaTags: true,
        blocks: {
          orderBy: [{ order: "asc" }],
        },
      },
    });
  }

  async getPageBySlug(slug: string): Promise<PageWithDetailsDto | null> {
    return await prisma.page.findUnique({
      where: {
        slug,
      },
      include: {
        metaTags: true,
        blocks: {
          orderBy: [{ order: "asc" }],
        },
      },
    });
  }

  async createPage(data: { slug: string; isPublished?: boolean; isPublic?: boolean }) {
    return await prisma.page.create({
      data,
    });
  }

  async updatePage(before: Page, data: { slug?: string; isPublished?: boolean; isPublic?: boolean }) {
    return await prisma.page
      .update({
        where: {
          id: before.id,
        },
        data,
      })
      .then((item) => {
        clearCacheKey(`page:${before.slug}`);
        return item;
      });
  }

  async deletePage(id: string) {
    return await prisma.page
      .delete({
        where: {
          id,
        },
      })
      .then((item) => {
        clearCacheKey(`page:${item.slug}`);
        clearCacheKey(`pageMetaTags:${item.slug}`);
        return item;
      });
  }

  // async groupPagesByType() {
  //   return await prisma.page.groupBy({
  //     by: ["type"],
  //     _count: {
  //       _all: true,
  //     },
  //   });
  // }
}
