import { Metadata } from "next";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getLinkTags } from "@/modules/pageBlocks/services/server/pagesService";
import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { SurveyDto, SurveyItemDto } from "@/modules/surveys/dtos/SurveyDtos";
import { SurveyWithDetailsDto } from "@/db/models/helpDesk/SurveysModel";
import SurveyUtils from "@/modules/surveys/utils/SurveyUtils";
import { getAnalyticsInfo } from "@/utils/analyticsCookie.server";
import { getClientIPAddress } from "@/utils/server/IpUtils";
import { prisma } from "@/db/config/prisma/database";
import ServerError from "@/components/ui/errors/ServerError";
import { getUserInfo } from "@/lib/services/session.server";
import { db } from "@/db";
import { getBaseURL } from "@/utils/url.server";
import { SurveyClientContent } from "./SurveyClientContent";
import { headers } from "next/headers";
import { notFound } from "next/navigation";

type LoaderData = {
  metatags: MetaTagsDto;
  item: SurveyDto;
  alreadyVoted: boolean;
  canShowResults: boolean;
};

async function getAlreadyVoted({ item, request }: { item: SurveyWithDetailsDto; request: Request }) {
  const analyticsInfo = await getAnalyticsInfo(request);
  const clientIpAddress = getClientIPAddress(request.headers) ?? "Unknown";
  const existingUserAnalytics = await prisma.surveySubmission
    .findFirstOrThrow({
      where: { surveyId: item.id, userAnalyticsId: analyticsInfo.userAnalyticsId },
    })
    .catch(() => null);
  const existingIpAddress = await prisma.surveySubmission
    .findFirstOrThrow({
      where: { surveyId: item.id, ipAddress: clientIpAddress },
    })
    .catch(() => null);

  if (existingUserAnalytics) {
    // eslint-disable-next-line no-console
    console.log("Already voted by cookie", { existingUserAnalytics: existingUserAnalytics.userAnalyticsId });
    return true;
  } else if (existingIpAddress) {
    // eslint-disable-next-line no-console
    console.log("Already voted by IP", { existingIpAddress: existingIpAddress.ipAddress });
    return true;
  }
  return false;
}

async function getLoaderData(slug: string, searchParams: { [key: string]: string | string[] | undefined }): Promise<LoaderData> {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.surveys) {
    notFound();
  }

  const userInfo = await getUserInfo();
  const user = userInfo.userId ? await db.users.getUser(userInfo.userId) : null;
  const item = await db.surveys.getSurveyBySlug({ tenantId: null, slug });

  if (!item) {
    notFound();
  }

  const headersList = await headers();
  const requestUrl = headersList.get("x-url") || `${getBaseURL()}/surveys/${slug}`;
  const request = new Request(requestUrl, {
    headers: headersList as any,
  });

  const alreadyVoted = await getAlreadyVoted({ item, request });

  const survey = SurveyUtils.surveyToDto(item);
  if (!survey.isPublic) {
    notFound();
  }

  const successParam = searchParams.success !== undefined || searchParams.results !== undefined;
  const submissions = await db.surveySubmissions.getSurveySubmissions(item.id);
  let canShowResults = submissions.length > survey.minSubmissions || !!user?.admin || survey.minSubmissions === 0;

  // eslint-disable-next-line no-console
  console.log("survey", { canShowResults, submissions: submissions.length, surveySubmissions: survey.minSubmissions });

  if ((alreadyVoted || survey.minSubmissions === 0) && successParam && canShowResults) {
    survey.results = {
      totalVotes: submissions.length,
      items: [],
    };
    item.items.forEach((surveyItem) => {
      const options = surveyItem.options as SurveyItemDto["options"];

      const surveyItemResult: { item: string; votes: Array<{ option: string; count: number; percentage: number }> } = {
        item: surveyItem.title,
        votes: [],
      };
      options.forEach((option) => {
        const optionSubmissions = submissions
          .flatMap((f) => f.results)
          .filter((r) => {
            if (r.surveyItemTitle !== surveyItem.title) {
              return false;
            }
            if (typeof r.value === "string") {
              return r.value === option.title;
            } else if (Array.isArray(r.value)) {
              return r.value.includes(option.title);
            }
            return false;
          });
        let count = optionSubmissions.length;
        let percentage = (count / submissions.length) * 100;
        surveyItemResult.votes.push({
          option: option.shortName || option.title,
          count,
          percentage,
        });
      });
      survey.results?.items.push(surveyItemResult);
    });
  }

  const linkTags = await getLinkTags(request);
  const data: LoaderData = {
    metatags: [
      { title: `${item.title} | ${getDefaultSiteTags().title}` },
      { description: item.description },
      { property: "og:title", content: `${item.title} | ${getDefaultSiteTags().title}` },
      { property: "og:description", content: item.description },
      {
        property: "og:image",
        content: item.image,
      },
      ...linkTags,
    ],
    item: survey,
    alreadyVoted,
    canShowResults,
  };
  return data;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = await db.surveys.getSurveyBySlug({ tenantId: null, slug });

  if (!item) {
    return {
      title: "Survey Not Found",
    };
  }

  return {
    title: `${item.title} | ${getDefaultSiteTags().title}`,
    description: item.description || undefined,
    openGraph: {
      title: `${item.title} | ${getDefaultSiteTags().title}`,
      description: item.description || undefined,
      images: item.image ? [{ url: item.image }] : undefined,
    },
  };
}

export default async function SurveyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { slug } = await params;
  const search = await searchParams;
  const data = await getLoaderData(slug, search);

  return (
    <>
      <HeaderBlock />
      <SurveyClientContent data={data} />
      <FooterBlock />
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
