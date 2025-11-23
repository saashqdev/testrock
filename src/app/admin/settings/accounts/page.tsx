import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("models.tenant.plural")} | ${getDefaultSiteTags.title}`,
  });
}

export default async function () {
  return <Component />;
}
