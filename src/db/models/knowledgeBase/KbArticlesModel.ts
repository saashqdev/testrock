import { KnowledgeBaseArticle, KnowledgeBaseRelatedArticle } from "@prisma/client";

export type KnowledgeBaseArticleWithDetailsDto = KnowledgeBaseArticle & {
  knowledgeBase: { id: string; slug: string; title: string };
  category: { slug: string; title: string } | null;
  section: { order: number; title: string } | null;
  relatedArticles: (KnowledgeBaseRelatedArticle & {
    relatedArticle: { id: string; order: number; title: string; slug: string };
  })[];
  createdByUser: {
    email: string;
    firstName: string;
    lastName: string;
    avatar: string | null;
  } | null;
  _count: {
    views: number;
    upvotes: number;
    downvotes: number;
  };
};

export type KnowledgeBaseArticleDto = {
  id: string;
  knowledgeBaseId: string;
  title: string;
  language: string;
  category: { id: string; slug: string; title: string } | null;
  section: { id: string; order: number; title: string } | null;
};
