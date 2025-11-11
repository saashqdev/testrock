import { IKbArticlesDb } from "@/db/interfaces/knowledgebase/IKbArticlesDb";
import { KnowledgeBaseArticleDto, KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { prisma } from "@/db/config/prisma/database";
import { PaginationDto } from "@/lib/dtos/PaginationDto";
import { Prisma } from "@prisma/client";
import { clearCacheKey, cachified } from "@/lib/services/cache.server";

const include = {
  knowledgeBase: {
    select: { slug: true, title: true, id: true },
  },
  category: {
    select: { slug: true, title: true },
  },
  section: {
    select: { order: true, title: true },
  },
  relatedArticles: {
    include: {
      relatedArticle: {
        select: { id: true, order: true, title: true, slug: true },
      },
    },
  },
  createdByUser: {
    select: { email: true, firstName: true, lastName: true, avatar: true },
  },
  _count: {
    select: { views: true, upvotes: true, downvotes: true },
  },
};
export class KbArticlesDbPrisma implements IKbArticlesDb {
  async getAllKnowledgeBaseArticles({
    knowledgeBaseSlug,
    categoryId,
    language,
  }: {
    knowledgeBaseSlug: string;
    categoryId?: string;
    language: string | undefined;
  }): Promise<KnowledgeBaseArticleWithDetailsDto[]> {
    return await prisma.knowledgeBaseArticle.findMany({
      where: {
        knowledgeBase: { slug: knowledgeBaseSlug },
        categoryId,
        language,
      },
      include,
      orderBy: [
        {
          category: { order: "asc" },
        },
        {
          section: { order: "asc" },
        },
        {
          order: "asc",
        },
      ],
    });
  }

  async getAllKnowledgeBaseArticlesWithPagination({
    knowledgeBaseSlug,
    language,
    pagination,
    filters,
  }: {
    knowledgeBaseSlug: string | undefined;
    language: string | undefined;
    pagination: {
      page: number;
      pageSize: number;
    };
    filters: {
      title?: string;
      description?: string;
      categoryId?: string | null;
      content?: string;
    };
  }): Promise<{
    items: KnowledgeBaseArticleWithDetailsDto[];
    pagination: PaginationDto;
  }> {
    const where: Prisma.KnowledgeBaseArticleWhereInput = {
      knowledgeBase: { slug: knowledgeBaseSlug },
      language,
    };
    if (filters.title !== undefined) {
      where.title = { contains: filters.title, mode: "insensitive" };
    }
    if (filters.description !== undefined) {
      where.description = { contains: filters.description, mode: "insensitive" };
    }
    if (filters.categoryId !== undefined) {
      where.categoryId = filters.categoryId;
    }
    if (filters.content !== undefined) {
      where.contentPublishedAsText = { contains: filters.content, mode: "insensitive" };
    }
    const items = await prisma.knowledgeBaseArticle.findMany({
      take: pagination.pageSize,
      skip: (pagination.page - 1) * pagination.pageSize,
      where,
      include,
      orderBy: [{ updatedAt: "desc" }, { createdAt: "desc" }],
    });
    const totalItems = await prisma.knowledgeBaseArticle.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }

  async findKnowledgeBaseArticles({
    knowledgeBaseSlug,
    language,
    query,
  }: {
    knowledgeBaseSlug: string;
    language: string | undefined;
    query: string;
  }): Promise<KnowledgeBaseArticleWithDetailsDto[]> {
    return await prisma.knowledgeBaseArticle.findMany({
      where: {
        knowledgeBase: { slug: knowledgeBaseSlug },
        language,
        publishedAt: { not: null },
        OR: [
          { title: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
          {
            contentPublishedAsText: { contains: query, mode: "insensitive" },
          },
        ],
      },
      include,
      orderBy: [
        {
          category: { order: "asc" },
        },
        {
          section: { order: "asc" },
        },
        {
          order: "asc",
        },
      ],
    });
  }

  async getFeaturedKnowledgeBaseArticles({
    knowledgeBaseId,
    language,
  }: {
    knowledgeBaseId: string;
    language: string;
  }): Promise<KnowledgeBaseArticleWithDetailsDto[]> {
    return await prisma.knowledgeBaseArticle.findMany({
      where: {
        knowledgeBaseId,
        language,
        featuredOrder: { not: null },
        publishedAt: { not: null },
      },
      include,
      orderBy: [{ featuredOrder: "asc" }],
    });
  }

  async getKbArticleById(id: string): Promise<KnowledgeBaseArticleWithDetailsDto | null> {
    return await prisma.knowledgeBaseArticle.findUnique({
      where: { id },
      include,
    });
  }

  async getKbArticleBySlug({
    knowledgeBaseId,
    slug,
    language,
  }: {
    knowledgeBaseId: string;
    slug: string;
    language: string;
  }): Promise<KnowledgeBaseArticleWithDetailsDto | null> {
    return await cachified({
      key: `kb-article:${knowledgeBaseId}:${slug}:${language}`,
      ttl: 60 * 60 * 24,
      getFreshValue: () =>
        prisma.knowledgeBaseArticle
          .findFirstOrThrow({
            where: {
              knowledgeBaseId,
              slug,
              language,
            },
            include: {
              ...include,
              // category: {
              //   include: {
              //     articles: {
              //       select: { id: true, order: true, title: true, description: true, slug: true, language: true, sectionId: true, publishedAt: true },
              //     },
              //     sections: {
              //       select: { id: true, order: true, title: true, description: true },
              //     },
              //   },
              // },
            },
          })
          .catch(() => {
            return null;
          }),
    });
  }

  async createKnowledgeBaseArticle(data: {
    knowledgeBaseId: string;
    categoryId: string | null;
    sectionId: string | null;
    slug: string;
    title: string;
    description: string;
    order: number;
    contentDraft: string;
    contentPublished: string;
    contentPublishedAsText: string;
    contentType: string;
    language: string;
    featuredOrder: number | null;
    createdByUserId: string | null;
    seoImage: string;
    publishedAt: Date | null;
  }) {
    return await prisma.knowledgeBaseArticle.create({
      data: {
        knowledgeBaseId: data.knowledgeBaseId,
        categoryId: data.categoryId,
        sectionId: data.sectionId,
        slug: data.slug,
        title: data.title,
        description: data.description,
        order: data.order,
        contentDraft: data.contentDraft,
        contentPublished: data.contentPublished,
        contentPublishedAsText: data.contentPublishedAsText,
        contentType: data.contentType,
        language: data.language,
        featuredOrder: data.featuredOrder,
        createdByUserId: data.createdByUserId,
        seoImage: data.seoImage,
        publishedAt: data.publishedAt,
      },
    });
  }

  async updateKnowledgeBaseArticle(
    id: string,
    data: {
      categoryId?: string | null;
      sectionId?: string | null;
      slug?: string;
      title?: string;
      description?: string;
      order?: number;
      contentDraft?: string;
      contentPublished?: string;
      contentPublishedAsText?: string;
      contentType?: string;
      language?: string;
      featuredOrder?: number | null;
      createdByUserId?: string | null;
      seoImage?: string;
      publishedAt?: Date | null;
      relatedArticles?: string[];
    }
  ) {
    const update: Prisma.KnowledgeBaseArticleUncheckedUpdateInput = {
      categoryId: data.categoryId,
      sectionId: data.sectionId,
      slug: data.slug,
      title: data.title,
      description: data.description,
      order: data.order,
      contentDraft: data.contentDraft,
      contentPublished: data.contentPublished,
      contentPublishedAsText: data.contentPublishedAsText,
      contentType: data.contentType,
      language: data.language,
      featuredOrder: data.featuredOrder,
      createdByUserId: data.createdByUserId,
      seoImage: data.seoImage,
      publishedAt: data.publishedAt,
    };
    const updatedArticle = await prisma.knowledgeBaseArticle
      .update({
        where: { id },
        data: update,
      })
      .then((item) => {
        clearCacheKey(`kb-article:${item.knowledgeBaseId}:${item.slug}:${item.language}`);
        return item;
      });
    if (data.relatedArticles) {
      await prisma.knowledgeBaseRelatedArticle.deleteMany({
        where: {
          articleId: id,
        },
      });
      await prisma.knowledgeBaseRelatedArticle.createMany({
        data: data.relatedArticles.map((f) => {
          return {
            articleId: id,
            relatedArticleId: f,
          };
        }),
      });
    }
    return updatedArticle;
  }

  async deleteKnowledgeBaseArticle(id: string) {
    return await prisma.knowledgeBaseArticle
      .delete({
        where: { id },
      })
      .then((item) => {
        clearCacheKey(`kb-article:${item.knowledgeBaseId}:${item.slug}:${item.language}`);
        return item;
      });
  }

  async countKnowledgeBaseArticles() {
    return await prisma.knowledgeBaseArticle.count();
  }

  async getAllKnowledgeBaseArticlesSimple(): Promise<KnowledgeBaseArticleDto[]> {
    return await prisma.knowledgeBaseArticle.findMany({
      select: {
        id: true,
        knowledgeBaseId: true,
        title: true,
        language: true,
        category: { select: { id: true, slug: true, title: true } },
        section: { select: { id: true, order: true, title: true } },
      },
      orderBy: [
        {
          knowledgeBaseId: "asc",
        },
        {
          category: { order: "asc" },
        },
        {
          section: { order: "asc" },
        },
        {
          order: "asc",
        },
      ],
    });
  }
}
