import HeaderBlock from "@/modules/pageBlocks/blocks/marketing/header/HeaderBlock";
import FooterBlock from "@/modules/pageBlocks/blocks/marketing/footer/FooterBlock";
import { defaultSiteTags, getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";
import { getServerTranslations } from "@/i18n/server";
import PrivacyPolicyClient from "./PrivacyPolicyClient";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return getMetaTags({
    title: `${t("front.privacy.title")} | ${defaultSiteTags.title}`,
  });
}

export default async function PrivacyPolicyPage() {
  return (
    <div>
      <div>
        <HeaderBlock />
        <PrivacyPolicyClient />
        <FooterBlock />
      </div>
    </div>
  );
}

