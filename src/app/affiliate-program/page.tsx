import { getDefaultSiteTags } from "@/modules/pageBlocks/utils/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Page404 from "@/components/pages/Page404";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Metadata } from "next";
import AffiliateProgramView from "./AffiliateProgramView";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("affiliates.program")} | ${getDefaultSiteTags().title}`,
    description: t("affiliates.description"),
  };
}

type LoaderData = {
  enabled?: boolean;
  contactEmail?: string;
  affiliates: {
    percentage: number;
    plans: { title: string; price: number }[];
    signUpLink: string;
  };
};

async function loader(props: IServerComponentsProps): Promise<LoaderData | { enabled: false }> {
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  let affiliatesConfig = appConfiguration.affiliates;
  if (!affiliatesConfig) {
    return { enabled: false };
  }
  if (!affiliatesConfig?.provider.rewardfulApiKey) {
    throw Error("[Affiliates] Rewardful API key is not set.");
  } else if (!affiliatesConfig?.percentage) {
    throw Error("[Affiliates] Percentage is not set.");
  } else if (!affiliatesConfig?.plans || affiliatesConfig.plans.length === 0) {
    throw Error("[Affiliates] Plans are not set.");
  } else if (!affiliatesConfig?.signUpLink) {
    throw Error("[Affiliates] SignUp link is not set.");
  }
  const data: LoaderData = {
    enabled: true,
    contactEmail: appConfiguration.email.supportEmail,
    affiliates: {
      percentage: affiliatesConfig.percentage,
      plans: affiliatesConfig.plans,
      signUpLink: affiliatesConfig.signUpLink,
    },
  };
  return data;
}

export default async function AffiliateProgramPage(props: IServerComponentsProps) {
  const data = await loader(props);
  if ("enabled" in data && !data.enabled) {
    return <Page404 />;
  }
  return <AffiliateProgramView data={data as LoaderData} />;
}
