import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  const siteTags = getDefaultSiteTags();
  return {
    title: `${t("models.tenant.plural")} | ${siteTags.title}`,
  };
}

export default async function () {
  return <Component />;
}
