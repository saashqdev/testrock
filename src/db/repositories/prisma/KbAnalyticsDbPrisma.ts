import { IKbAnalyticsDb } from "@/db/interfaces/knowledgebase/IKbAnalyticsDb";
import { prisma } from "@/db/config/prisma/database";

export class KbAnalyticsDbPrisma implements IKbAnalyticsDb {
  async createKnowledgeBaseView({ userAnalyticsId, knowledgeBaseId }: { userAnalyticsId: string | null; knowledgeBaseId: string }) {
    if (!userAnalyticsId) {
      return;
    }
    await prisma.knowledgeBaseViews.upsert({
      where: {
        knowledgeBaseId_userAnalyticsId: {
          userAnalyticsId,
          knowledgeBaseId,
        },
      },
      create: {
        userAnalyticsId,
        knowledgeBaseId,
      },
      update: {},
    });
  }

  async createKnowledgeBaseArticleView({ userAnalyticsId, articleId }: { userAnalyticsId: string | null; articleId: string }) {
    if (!userAnalyticsId) {
      return;
    }
    await prisma.knowledgeBaseArticleViews.upsert({
      where: {
        knowledgeBaseArticleId_userAnalyticsId: {
          userAnalyticsId,
          knowledgeBaseArticleId: articleId,
        },
      },
      create: {
        userAnalyticsId,
        knowledgeBaseArticleId: articleId,
      },
      update: {},
    });
  }

  async voteArticle({ userAnalyticsId, articleId, type }: { userAnalyticsId: string | null; articleId: string; type: "up" | "down" }) {
    if (!userAnalyticsId) {
      return;
    }
    if (type === "up") {
      await prisma.knowledgeBaseArticleDownvotes.deleteMany({
        where: {
          userAnalyticsId,
          knowledgeBaseArticleId: articleId,
        },
      });
      const existing = await prisma.knowledgeBaseArticleUpvotes.findUnique({
        where: {
          knowledgeBaseArticleId_userAnalyticsId: {
            userAnalyticsId,
            knowledgeBaseArticleId: articleId,
          },
        },
      });
      if (!existing) {
        await prisma.knowledgeBaseArticleUpvotes.create({
          data: {
            userAnalyticsId,
            knowledgeBaseArticleId: articleId,
          },
        });
      } else {
        await prisma.knowledgeBaseArticleUpvotes.delete({
          where: {
            knowledgeBaseArticleId_userAnalyticsId: {
              userAnalyticsId,
              knowledgeBaseArticleId: articleId,
            },
          },
        });
      }
    } else {
      await prisma.knowledgeBaseArticleUpvotes.deleteMany({
        where: {
          userAnalyticsId,
          knowledgeBaseArticleId: articleId,
        },
      });
      const existing = await prisma.knowledgeBaseArticleDownvotes.findUnique({
        where: {
          knowledgeBaseArticleId_userAnalyticsId: {
            userAnalyticsId,
            knowledgeBaseArticleId: articleId,
          },
        },
      });
      if (!existing) {
        await prisma.knowledgeBaseArticleDownvotes.create({
          data: {
            userAnalyticsId,
            knowledgeBaseArticleId: articleId,
          },
        });
      } else {
        await prisma.knowledgeBaseArticleDownvotes.delete({
          where: {
            knowledgeBaseArticleId_userAnalyticsId: {
              userAnalyticsId,
              knowledgeBaseArticleId: articleId,
            },
          },
        });
      }
    }
  }

  async getArticleStateByUserAnalyticsId({ userAnalyticsId, articleId }: { userAnalyticsId: string | null; articleId: string }) {
    if (!userAnalyticsId) {
      return {
        hasThumbsUp: false,
        hasThumbsDown: false,
      };
    }
    return {
      hasThumbsUp: !!(await prisma.knowledgeBaseArticleUpvotes.findUnique({
        where: {
          knowledgeBaseArticleId_userAnalyticsId: {
            userAnalyticsId,
            knowledgeBaseArticleId: articleId,
          },
        },
      })),
      hasThumbsDown: !!(await prisma.knowledgeBaseArticleDownvotes.findUnique({
        where: {
          knowledgeBaseArticleId_userAnalyticsId: {
            userAnalyticsId,
            knowledgeBaseArticleId: articleId,
          },
        },
      })),
    };
  }

  async countAllKbsViews() {
    return await prisma.knowledgeBaseViews.count();
  }

  async countAllKbsArticleViews() {
    return await prisma.knowledgeBaseArticleViews.count();
  }

  async countAllKbsArticleUpvotes() {
    return await prisma.knowledgeBaseArticleUpvotes.count();
  }

  async countAllKbsArticleDownvotes() {
    return await prisma.knowledgeBaseArticleDownvotes.count();
  }
}
