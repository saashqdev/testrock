import { Prisma } from "@prisma/client";
export interface IAnalyticsUniqueVisitorsDb {
  groupUniqueVisitorsBy(by: Prisma.AnalyticsUniqueVisitorScalarFieldEnum): Promise<
    {
      name: string;
      count: number;
    }[]
  >;
}
