import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("models.tenant.plural")} | ${defaultSiteTags.title}`,
  });
}

export default async function () {
  return <Component />;
}
