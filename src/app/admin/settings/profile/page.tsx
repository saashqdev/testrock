import { getServerTranslations } from "@/i18n/server";
import { getDefaultSiteTags, defaultSeoMetaTags} from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import Component from "./component";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return defaultSeoMetaTags({
    title: `${t("settings.profile.profileTitle")} | ${getDefaultSiteTags.title}`,
  });
}

export default async function () {
  return <Component />;
}
