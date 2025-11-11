import { NextRequest, NextResponse } from "next/server";
import { AnalyticsUniqueVisitor, Prisma } from "@prisma/client";
import { AnalyticsInfoDto } from "@/lib/dtos/marketing/AnalyticsInfoDto";
import { getAnalyticsInfo } from "@/utils/analyticsCookie.server";
import { clearCacheKey } from "@/lib/services/cache.server";
import { prisma } from "@/db/config/prisma/database";
import AnalyticsService from "@/lib/helpers/server/AnalyticsService";

export async function GET() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, referer-path",
        "Access-Control-Allow-Methods": "GET",
      },
    }
  );
}

export async function OPTIONS() {
  return NextResponse.json(
    {},
    {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, HEAD, POST, PUT, DELETE",
        "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept, referer-path",
      },
    }
  );
}

// const ignoreUrl = ["/admin/analytics"];
export async function POST(request: NextRequest) {
  try {
    // const userInfo = await getUserInfo();
    // if (!CookieHelper.hasConsent(userInfo, CookieCategory.ANALYTICS)) {
    //   return NextResponse.json({ error: "User has not consented to analytics" }, 400);
    // }
    const analyticsSessionInfo = await getAnalyticsInfo(request);

    const jsonBody = (await request.json()) as {
      url: string;
      route: string;
      analytics: AnalyticsInfoDto;
    };

    let userAnalyticsId = analyticsSessionInfo?.userAnalyticsId ?? jsonBody.analytics.userAnalyticsId;
    if (!userAnalyticsId) {
      return NextResponse.json({ error: "Invalid Analytics Cookie" }, { status: 401 });
    }

    const settings = await prisma.analyticsSettings.findFirst({});
    const ignoredPages = settings?.ignorePages?.split(",") ?? [];

    if (ignoredPages.find((f) => f !== "" && jsonBody.url.includes(f))) {
      return NextResponse.json({ error: "Ignored URL" }, { status: 204 });
    }
    const uniqueVisitor = await AnalyticsService.getOrCreateUniqueVisitor({
      cookie: userAnalyticsId,
      fromUrl: jsonBody.url,
      fromRoute: jsonBody.route,
      analytics: jsonBody.analytics,
    });
    if (!uniqueVisitor) {
      throw new Error("Unique visitor not found");
    }
    await updateUniqueVisitorSource(uniqueVisitor, jsonBody.analytics);
    await prisma.analyticsPageView.create({
      data: {
        uniqueVisitorId: uniqueVisitor.id,
        url: jsonBody.url,
        route: jsonBody.route,
        portalId: jsonBody.analytics.portalId || null,
        portalUserId: jsonBody.analytics.portalUserId || null,
      },
    });

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}

async function updateUniqueVisitorSource(uniqueVisitor: AnalyticsUniqueVisitor, analytics: AnalyticsInfoDto) {
  let where = { id: uniqueVisitor.id };
  const data: Prisma.AnalyticsUniqueVisitorUncheckedUpdateInput = {};
  if (analytics.referrer?.source && uniqueVisitor.source !== analytics.referrer?.source) {
    data.source = analytics.referrer?.source;
  }
  if (analytics.referrer?.utm_medium && uniqueVisitor.medium !== analytics.referrer?.utm_medium) {
    data.medium = analytics.referrer?.utm_medium;
  }
  if (analytics.referrer?.utm_campaign && uniqueVisitor.campaign !== analytics.referrer?.utm_campaign) {
    data.campaign = analytics.referrer?.utm_campaign;
  }
  if (analytics.referrer?.utm_content && uniqueVisitor.content !== analytics.referrer?.utm_content) {
    data.content = analytics.referrer?.utm_content;
  }
  if (analytics.referrer?.utm_term && uniqueVisitor.term !== analytics.referrer?.utm_term) {
    data.term = analytics.referrer?.utm_term;
  }
  if (analytics.region?.country && uniqueVisitor.country !== analytics.region?.country) {
    data.country = analytics.region?.country;
  }
  if (analytics.region?.city && uniqueVisitor.city !== analytics.region?.city) {
    data.city = analytics.region?.city;
  }
  if (analytics.userId && uniqueVisitor.userId !== analytics.userId) {
    data.userId = analytics.userId;
  }
  if (analytics.portalUserId && uniqueVisitor.portalUserId !== analytics.portalUserId) {
    data.portalUserId = analytics.portalUserId;
  }
  if (Object.keys(data).length > 0) {
    await prisma.analyticsUniqueVisitor.update({ where, data }).then((item) => {
      clearCacheKey(`analytics:uniqueVisitor:${item.cookie}`);
      return item;
    });
  }
}
