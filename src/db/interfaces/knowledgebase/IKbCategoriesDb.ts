import { KnowledgeBaseCategoryDto } from "@/db/models/knowledgeBase/KbCategoriesModel";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";

export interface IKbCategoriesDb {
  getAllKnowledgeBaseCategories({
    knowledgeBaseSlug,
    language,
  }: {
    knowledgeBaseSlug: string | undefined;
    language: string | undefined;
  }): Promise<KnowledgeBaseCategoryWithDetailsDto[]>;
  getAllKnowledgeBaseCategoriesSimple(): Promise<KnowledgeBaseCategoryDto[]>;
  getKbCategoryById(id: string): Promise<KnowledgeBaseCategoryWithDetailsDto | null>;
  getKbCategoryBySlug({
    knowledgeBaseId,
    slug,
    language,
  }: {
    knowledgeBaseId: string;
    slug: string;
    language: string | undefined;
  }): Promise<KnowledgeBaseCategoryWithDetailsDto | null>;
  createKnowledgeBaseCategory(data: {
    knowledgeBaseId: string;
    slug: string;
    order: number;
    title: string;
    description: string;
    icon: string;
    language: string;
    seoImage: string;
  }): Promise<KnowledgeBaseCategoryWithDetailsDto>;
  updateKnowledgeBaseCategory(
    id: string,
    data: {
      slug?: string | undefined;
      title?: string | undefined;
      order?: number | undefined;
      description?: string | undefined;
      icon?: string | undefined;
      language?: string | undefined;
      seoImage?: string | undefined;
    }
  ): Promise<{
    language: string;
    knowledgeBaseId: string;
    slug: string;
    id: string;
    order: number;
    title: string;
    description: string;
    icon: string;
    seoImage: string;
  }>;
  deleteKnowledgeBaseCategory(id: string): Promise<{
    language: string;
    knowledgeBaseId: string;
    slug: string;
    id: string;
    order: number;
    title: string;
    description: string;
    icon: string;
    seoImage: string;
  }>;
  countKnowledgeBaseCategories(): Promise<number>;
}
