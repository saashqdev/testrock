import { Metadata } from "next";
import { notFound } from "next/navigation";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import { getDefaultSiteTags } from "@/modules/pageBlocks/utils/defaultSeoMetaTags";
import EmptyState from "@/components/ui/emptyState/EmptyState";
import { getBaseURL } from "@/utils/url.server";
import { getServerTranslations } from "@/i18n/server";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import { db } from "@/db";
import SurveysClient from "./SurveysClient";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  const title = `${t("surveys.title")} | ${getDefaultSiteTags().title}`;
  const description = t("surveys.description");

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${getBaseURL()}/surveys`,
    },
    twitter: {
      title,
      description,
    },
  };
}

async function getData() {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  if (!appConfiguration.app.features.surveys) {
    notFound();
  }
  
  const items = await db.surveys.getAllSurveys({ tenantId: null, isPublic: true });
  return { items };
}

export default async function SurveysPage() {
  const { t } = await getServerTranslations();
  const data = await getData();
  
  return (
    <div>
      <div>
        <HeaderBlock />
        <div className="py-4">
          <HeadingBlock
            item={{
              style: "centered",
              headline: t("surveys.title"),
              subheadline: t("surveys.description"),
            }}
          />
        </div>
        <div className="mx-auto min-h-screen max-w-5xl space-y-8 px-6 py-6">
          <div className="mx-auto max-w-5xl">
            {data.items.length === 0 ? (
              <div>
                <EmptyState captions={{ description: "There are currently no surveys available." }} />
              </div>
            ) : (
              <SurveysClient items={data.items} />
            )}
          </div>
        </div>
        <FooterBlock />
      </div>
    </div>
  );
}
