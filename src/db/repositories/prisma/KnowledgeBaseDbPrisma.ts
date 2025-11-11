import { IKnowledgeBaseDb } from "@/db/interfaces/knowledgebase/IKnowledgeBaseDb";
import { prisma } from "@/db/config/prisma/database";
import { KnowledgeBaseWithDetailsDto } from "@/db/models/knowledgeBase/KnowledgeBaseModel";
import { clearCacheKey } from "@/lib/services/cache.server";

const include = {
  _count: {
    select: { categories: true, articles: true, views: true },
  },
};
export class KnowledgeBaseDbPrisma implements IKnowledgeBaseDb {
  async getAllKnowledgeBases({ enabled }: { enabled?: boolean } = {}): Promise<KnowledgeBaseWithDetailsDto[]> {
    return await prisma.knowledgeBase.findMany({
      where: { enabled },
      include,
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getAllKnowledgeBaseNames(): Promise<{ id: string; title: string }[]> {
    return await prisma.knowledgeBase.findMany({
      select: {
        id: true,
        title: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async getKnowledgeBaseById(id: string): Promise<KnowledgeBaseWithDetailsDto | null> {
    return await prisma.knowledgeBase.findUnique({
      where: { id },
      include,
    });
  }

  async getKnowledgeBaseBySlug(slug: string): Promise<KnowledgeBaseWithDetailsDto | null> {
    return await prisma.knowledgeBase.findUnique({
      where: { slug },
      include,
    });
  }

  async createKnowledgeBase(data: {
    basePath: string;
    slug: string;
    title: string;
    description: string;
    defaultLanguage: string;
    layout: string;
    color: number;
    enabled: boolean;
    languages: string;
    links: string;
    logo: string;
    seoImage: string;
  }) {
    return await prisma.knowledgeBase.create({
      data: {
        basePath: data.basePath,
        slug: data.slug,
        title: data.title,
        description: data.description,
        defaultLanguage: data.defaultLanguage,
        layout: data.layout,
        color: data.color,
        enabled: data.enabled,
        languages: data.languages,
        links: data.links,
        logo: data.logo,
        seoImage: data.seoImage,
      },
    });
  }

  async updateKnowledgeBase(
    id: string,
    data: {
      basePath?: string;
      slug?: string;
      title?: string;
      description?: string;
      defaultLanguage?: string;
      layout?: string;
      color?: number;
      enabled?: boolean;
      languages?: string;
      links?: string;
      logo?: string;
      seoImage?: string;
    }
  ) {
    return await prisma.knowledgeBase
      .update({
        where: { id },
        data: {
          basePath: data.basePath,
          slug: data.slug,
          title: data.title,
          description: data.description,
          defaultLanguage: data.defaultLanguage,
          layout: data.layout,
          color: data.color,
          enabled: data.enabled,
          languages: data.languages,
          links: data.links,
          logo: data.logo,
          seoImage: data.seoImage,
        },
      })
      .then((item) => {
        clearCacheKey(`kb:${item.slug}`);
        return item;
      });
  }

  async deleteKnowledgeBase(id: string) {
    return await prisma.knowledgeBase
      .delete({
        where: { id },
      })
      .then((item) => {
        clearCacheKey(`kb:${item.slug}`);
        return item;
      });
  }

  async countKnowledgeBases() {
    return await prisma.knowledgeBase.count();
  }
}
