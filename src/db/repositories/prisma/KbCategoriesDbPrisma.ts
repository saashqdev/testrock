import { IKbCategoriesDb } from "@/db/interfaces/knowledgebase/IKbCategoriesDb";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import { KnowledgeBaseCategoryDto } from "@/db/models/knowledgeBase/KbCategoriesModel";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";

const include = {
  articles: {
    select: { id: true, order: true, title: true, description: true, slug: true, language: true, sectionId: true, publishedAt: true },
  },
  sections: {
    select: { id: true, order: true, title: true, description: true },
  },
};

export class KbCategoriesDbPrisma implements IKbCategoriesDb {
  async getAllKnowledgeBaseCategories({
    knowledgeBaseSlug,
    language,
  }: {
    knowledgeBaseSlug: string | undefined;
    language: string | undefined;
  }): Promise<KnowledgeBaseCategoryWithDetailsDto[]> {
    return await prisma.knowledgeBaseCategory.findMany({
      where: {
        knowledgeBase: { slug: knowledgeBaseSlug },
        language,
      },
      include,
      orderBy: { order: "asc" },
    });
  }

  async getAllKnowledgeBaseCategoriesSimple(): Promise<KnowledgeBaseCategoryDto[]> {
    return await prisma.knowledgeBaseCategory.findMany({
      select: {
        id: true,
        knowledgeBaseId: true,
        title: true,
        language: true,
        sections: { select: { id: true, order: true, title: true } },
      },
      orderBy: [{ knowledgeBaseId: "asc" }, { order: "asc" }],
    });
  }

  async getKbCategoryById(id: string): Promise<KnowledgeBaseCategoryWithDetailsDto | null> {
    return await prisma.knowledgeBaseCategory.findUnique({
      where: { id },
      include,
    });
  }

  async getKbCategoryBySlug({
    knowledgeBaseId,
    slug,
    language,
  }: {
    knowledgeBaseId: string;
    slug: string;
    language: string | undefined;
  }): Promise<KnowledgeBaseCategoryWithDetailsDto | null> {
    const where: Prisma.KnowledgeBaseCategoryWhereInput = {
      knowledgeBaseId,
      slug,
      language,
    };
    return await prisma.knowledgeBaseCategory.findFirst({
      where,
      include,
    });
  }

  async createKnowledgeBaseCategory(data: {
    knowledgeBaseId: string;
    slug: string;
    order: number;
    title: string;
    description: string;
    icon: string;
    language: string;
    seoImage: string;
  }): Promise<KnowledgeBaseCategoryWithDetailsDto> {
    return await prisma.knowledgeBaseCategory.create({
      data: {
        knowledgeBaseId: data.knowledgeBaseId,
        slug: data.slug,
        order: data.order,
        title: data.title,
        description: data.description,
        icon: data.icon,
        language: data.language,
        seoImage: data.seoImage,
      },
      include,
    });
  }

  async updateKnowledgeBaseCategory(
    id: string,
    data: {
      slug?: string;
      title?: string;
      order?: number;
      description?: string;
      icon?: string;
      language?: string;
      seoImage?: string;
    }
  ) {
    return await prisma.knowledgeBaseCategory.update({
      where: { id },
      data: {
        slug: data.slug,
        order: data.order,
        title: data.title,
        description: data.description,
        icon: data.icon,
        language: data.language,
        seoImage: data.seoImage,
      },
    });
  }

  async deleteKnowledgeBaseCategory(id: string) {
    return await prisma.knowledgeBaseCategory.delete({
      where: { id },
    });
  }

  async countKnowledgeBaseCategories() {
    return await prisma.knowledgeBaseCategory.count();
  }
}
