import { NextRequest, NextResponse } from "next/server";
import { cachified } from "@/lib/services/cache.server";
import AnalyticsService from "@/lib/helpers/server/AnalyticsService";
import PeriodHelper, { PeriodFilters, defaultPeriodFilter } from "@/lib/helpers/PeriodHelper";

export async function GET(request: NextRequest) {
  try {
    if (!process.env.ANALYTICS_TOKEN) {
      throw Error("ANALYTICS_TOKEN not set");
    }
    if (process.env.ANALYTICS_TOKEN.toString() === "1234567890") {
      throw Error("ANALYTICS_TOKEN cannot be default value");
    }
    const apiAnalyticsHeader = request.headers.get("X-ANALYTICS-TOKEN");
    if (!apiAnalyticsHeader || apiAnalyticsHeader !== process.env.ANALYTICS_TOKEN) {
      throw Error("Invalid API token");
    }

    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period") || defaultPeriodFilter;

    const validPeriod = PeriodFilters.find((p) => p.value === period);
    if (!validPeriod) {
      throw Error(`Invalid period ${period}. Valid periods are ${PeriodFilters.map((p) => p.value).join(", ")}`);
    }

    console.log({ period });

    const data = await cachified({
      key: `analytics:public:${period}`,
      ttl: 60 * 60 * 24,
      getFreshValue: () =>
        AnalyticsService.getAnalyticsOverview({
          withUsers: false,
          period: PeriodHelper.getPeriodFromRequest({ request }),
          portalId: null,
        }),
    });

    return NextResponse.json(data);
  } catch (e: any) {
    console.log("analytics error", e.message);
    return NextResponse.json({ error: e.message }, { status: 401 });
  }
}
