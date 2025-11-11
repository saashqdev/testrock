import { IKbCategorySectionsDb } from "@/db/interfaces/knowledgebase/IKbCategorySectionsDb";
import { prisma } from "@/db/config/prisma/database";
import { KnowledgeBaseCategorySectionWithDetailsDto } from "@/db/models/knowledgeBase/KbCategorySectionsModel";
export class KbCategorySectionsDbPrisma implements IKbCategorySectionsDb {
  async getAllKnowledgeBaseCategorySections(): Promise<KnowledgeBaseCategorySectionWithDetailsDto[]> {
    return await prisma.knowledgeBaseCategorySection.findMany({
      include: {
        articles: { select: { id: true, order: true, title: true } },
      },
    });
  }

  async getKbCategorySectionById(id: string): Promise<KnowledgeBaseCategorySectionWithDetailsDto | null> {
    return await prisma.knowledgeBaseCategorySection.findUnique({
      where: { id },
      include: {
        articles: { select: { id: true, order: true, title: true } },
      },
    });
  }

  async createKnowledgeBaseCategorySection(data: { categoryId: string; order: number; title: string; description: string }) {
    return await prisma.knowledgeBaseCategorySection.create({
      data: {
        categoryId: data.categoryId,
        order: data.order,
        title: data.title,
        description: data.description,
      },
    });
  }

  async updateKnowledgeBaseCategorySection(
    id: string,
    data: {
      order?: number;
      title?: string;
      description?: string;
    }
  ) {
    return await prisma.knowledgeBaseCategorySection.update({
      where: { id },
      data: {
        order: data.order,
        title: data.title,
        description: data.description,
      },
    });
  }

  async deleteKnowledgeBaseCategorySection(id: string) {
    return await prisma.knowledgeBaseCategorySection.delete({
      where: { id },
    });
  }
}
