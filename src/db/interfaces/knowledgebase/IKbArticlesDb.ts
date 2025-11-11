import { KnowledgeBaseArticleDto, KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { PaginationDto } from "@/lib/dtos/PaginationDto";

export interface IKbArticlesDb {
  getAllKnowledgeBaseArticles({
    knowledgeBaseSlug,
    categoryId,
    language,
  }: {
    knowledgeBaseSlug: string;
    categoryId?: string;
    language: string | undefined;
  }): Promise<KnowledgeBaseArticleWithDetailsDto[]>;
  getAllKnowledgeBaseArticlesWithPagination({
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
  }>;
  findKnowledgeBaseArticles({
    knowledgeBaseSlug,
    language,
    query,
  }: {
    knowledgeBaseSlug: string;
    language: string | undefined;
    query: string;
  }): Promise<KnowledgeBaseArticleWithDetailsDto[]>;
  getFeaturedKnowledgeBaseArticles({ knowledgeBaseId, language }: { knowledgeBaseId: string; language: string }): Promise<KnowledgeBaseArticleWithDetailsDto[]>;
  getKbArticleById(id: string): Promise<KnowledgeBaseArticleWithDetailsDto | null>;
  getKbArticleBySlug({
    knowledgeBaseId,
    slug,
    language,
  }: {
    knowledgeBaseId: string;
    slug: string;
    language: string;
  }): Promise<KnowledgeBaseArticleWithDetailsDto | null>;
  createKnowledgeBaseArticle(data: {
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
  }): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    knowledgeBaseId: string;
    categoryId: string | null;
    sectionId: string | null;
    slug: string;
    title: string;
    description: string;
    createdByUserId: string | null;
  }>;
  updateKnowledgeBaseArticle(
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
      relatedInArticleId?: string | null;
    }
  ): Promise<{
    categoryId: string | null;
    language: string;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    knowledgeBaseId: string;
    sectionId: string | null;
    slug: string;
    title: string;
    description: string;
    order: number;
    contentDraft: string;
    contentPublished: string;
    contentPublishedAsText: string;
    contentType: string;
    featuredOrder: number | null;
    seoImage: string;
    publishedAt: Date | null;
    relatedInArticleId: string | null;
    createdByUserId: string | null;
  }>;
  deleteKnowledgeBaseArticle(id: string): Promise<{
    categoryId: string | null;
    language: string;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    knowledgeBaseId: string;
    sectionId: string | null;
    slug: string;
    title: string;
    description: string;
    order: number;
    contentDraft: string;
    contentPublished: string;
    contentPublishedAsText: string;
    contentType: string;
    featuredOrder: number | null;
    seoImage: string;
    publishedAt: Date | null;
    relatedInArticleId: string | null;
    createdByUserId: string | null;
  }>;
  countKnowledgeBaseArticles(): Promise<number>;
  getAllKnowledgeBaseArticlesSimple(): Promise<KnowledgeBaseArticleDto[]>;
}
