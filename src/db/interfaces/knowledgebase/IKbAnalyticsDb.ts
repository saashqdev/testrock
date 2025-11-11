export interface IKbAnalyticsDb {
  createKnowledgeBaseView({ userAnalyticsId, knowledgeBaseId }: { userAnalyticsId: string | null; knowledgeBaseId: string }): Promise<void>;
  createKnowledgeBaseArticleView({ userAnalyticsId, articleId }: { userAnalyticsId: string | null; articleId: string }): Promise<void>;
  voteArticle({ userAnalyticsId, articleId, type }: { userAnalyticsId: string | null; articleId: string; type: "up" | "down" }): Promise<void>;
  getArticleStateByUserAnalyticsId({ userAnalyticsId, articleId }: { userAnalyticsId: string | null; articleId: string }): Promise<{
    hasThumbsUp: boolean;
    hasThumbsDown: boolean;
  }>;
  countAllKbsViews(): Promise<number>;
  countAllKbsArticleViews(): Promise<number>;
  countAllKbsArticleUpvotes(): Promise<number>;
  countAllKbsArticleDownvotes(): Promise<number>;
}
