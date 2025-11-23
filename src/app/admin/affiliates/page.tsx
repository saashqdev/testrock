import { getServerTranslations } from "@/i18n/server";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("affiliates.title")} | ${siteTags.title}`,
  };
}

export type AffiliatesLoaderData = {
  title: string;
};

async function load(): Promise<AffiliatesLoaderData> {
  await requireAuth();
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();

  const data: AffiliatesLoaderData = {
    title: `${t("affiliates.title")} | ${siteTags.title}`,
  };
  return data;
}

export default async function (_props: IServerComponentsProps) {
  const data = await load();

  return <Component data={data} />;
}
