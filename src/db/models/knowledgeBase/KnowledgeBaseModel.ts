import { KnowledgeBase } from "@prisma/client";

export type KnowledgeBaseModel = {
  id: string;
  title: string;
  content: string;
  tags: string[];
};

export type KnowledgeBaseWithDetailsDto = KnowledgeBase & {
  _count: {
    categories: number;
    articles: number;
    views: number;
  };
};
