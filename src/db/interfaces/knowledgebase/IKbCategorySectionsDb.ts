import { KnowledgeBaseCategorySectionWithDetailsDto } from "@/db/models/knowledgeBase/KbCategorySectionsModel";

export interface IKbCategorySectionsDb {
  getAllKnowledgeBaseCategorySections(): Promise<KnowledgeBaseCategorySectionWithDetailsDto[]>;
  getKbCategorySectionById(id: string): Promise<KnowledgeBaseCategorySectionWithDetailsDto | null>;
  createKnowledgeBaseCategorySection(data: { categoryId: string; order: number; title: string; description: string }): Promise<{
    id: string;
    categoryId: string;
    order: number;
    title: string;
    description: string;
  }>;
  updateKnowledgeBaseCategorySection(
    id: string,
    data: {
      order?: number | undefined;
      title?: string | undefined;
      description?: string | undefined;
    }
  ): Promise<{
    id: string;
    categoryId: string;
    order: number;
    title: string;
    description: string;
  }>;
  deleteKnowledgeBaseCategorySection(id: string): Promise<{
    id: string;
    categoryId: string;
    order: number;
    title: string;
    description: string;
  }>;
}
