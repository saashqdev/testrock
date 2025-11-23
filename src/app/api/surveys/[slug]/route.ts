import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { getAnalyticsInfo } from "@/utils/analyticsCookie.server";
import { getClientIPAddress } from "@/utils/server/IpUtils";
import { prisma } from "@/db/config/prisma/database";
import { SurveyItemResultDto } from "@/modules/surveys/dtos/SurveyDtos";
import NotificationService from "@/modules/notifications/services/server/NotificationService";
import { headers } from "next/headers";

async function getAlreadyVoted({ surveyId, request }: { surveyId: string; request: NextRequest }) {
  const analyticsInfo = await getAnalyticsInfo(request);
  const clientIpAddress = getClientIPAddress(request.headers) ?? "Unknown";

  const existingUserAnalytics = await prisma.surveySubmission
    .findFirstOrThrow({
      where: { surveyId, userAnalyticsId: analyticsInfo.userAnalyticsId },
    })
    .catch(() => null);

  const existingIpAddress = await prisma.surveySubmission
    .findFirstOrThrow({
      where: { surveyId, ipAddress: clientIpAddress },
    })
    .catch(() => null);

  if (existingUserAnalytics) {
    console.log("Already voted by cookie", { existingUserAnalytics: existingUserAnalytics.userAnalyticsId });
    return true;
  } else if (existingIpAddress) {
    console.log("Already voted by IP", { existingIpAddress: existingIpAddress.ipAddress });
    return true;
  }
  return false;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const item = await db.surveys.getSurveyBySlug({ tenantId: null, slug });

    if (!item) {
      return NextResponse.json({ error: "Survey not found" }, { status: 404 });
    }

    const analyticsInfo = await getAnalyticsInfo(request);
    const clientIpAddress = getClientIPAddress(request.headers) ?? "Unknown";

    const formData = await request.formData();
    const action = formData.get("action");

    if (action === "vote") {
      const alreadyVoted = await getAlreadyVoted({ surveyId: item.id, request });
      if (alreadyVoted) {
        return NextResponse.json({ error: "You've already voted" }, { status: 400 });
      }

      try {
        const results = JSON.parse(formData.get("results") as string) as SurveyItemResultDto[];
        if (results.length === 0) {
          return NextResponse.json({ error: "Results are required" }, { status: 400 });
        } else if (results.length !== item.items.length) {
          return NextResponse.json({ error: "Invalid results" }, { status: 400 });
        }

        if (!analyticsInfo.userAnalyticsId) {
          return NextResponse.json({ error: "You need to enable cookies to vote" }, { status: 400 });
        }

        await prisma.surveySubmission.create({
          data: {
            surveyId: item.id,
            userAnalyticsId: analyticsInfo.userAnalyticsId,
            ipAddress: clientIpAddress,
            results: {
              createMany: {
                data: results.map((result) => {
                  const surveyItem = item.items.find((i) => i.title === result.item);
                  if (!surveyItem) {
                    throw new Error("Invalid survey item: " + result.item);
                  }
                  let value: string | string[] = "";
                  if (surveyItem.type === "single-select") {
                    if (result.values.length > 0) {
                      value = result.values[0];
                    }
                  } else if (surveyItem.type === "multi-select") {
                    value = result.values;
                  }
                  return {
                    surveyItemTitle: result.item,
                    surveyItemType: surveyItem.title,
                    value,
                    other: result.other,
                  };
                }),
              },
            },
          },
        });

        await NotificationService.sendToRoles({
          channel: "admin-users",
          notification: {
            message: `Survey submission: ` + item.title,
            action: {
              url: `/admin/help-desk/surveys/${item.id}/submissions`,
            },
          },
        });

        return NextResponse.json({ success: true, redirect: `/surveys/${item.slug}?success=true` });
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: 500 });
  }
}
