import { KnowledgeBaseCategorySection } from "@prisma/client";

export type KnowledgeBaseCategorySectionWithDetailsDto = KnowledgeBaseCategorySection & {
  articles: {
    id: string;
    order: number;
    title: string;
  }[];
};
