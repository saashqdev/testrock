import { IAnalyticsUniqueVisitorsDb } from "@/db/interfaces/analytics/IAnalyticsUniqueVisitorsDb";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";

export class AnalyticsUniqueVisitorsDbPrisma implements IAnalyticsUniqueVisitorsDb {
  async groupUniqueVisitorsBy(by: Prisma.AnalyticsUniqueVisitorScalarFieldEnum) {
    return (
      await prisma.analyticsUniqueVisitor.groupBy({
        by: [by],
        _count: true,
      })
    ).map((f) => ({ name: f[by]?.toString() ?? ("" as string), count: f._count }));
  }
}
