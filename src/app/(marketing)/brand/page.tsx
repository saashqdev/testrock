import { Metadata } from "next";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import PreviewIcon from "@/components/ui/logo-and-icon/PreviewIcon";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import PreviewLogo from "@/components/ui/logo-and-icon/PreviewLogo";
import { getDefaultSiteTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("front.brand.title")} | ${getDefaultSiteTags().title}`,
    description: t("front.brand.description"),
  };
}

export default async function BrandPage() {
  const { t } = await getServerTranslations();
  return (
    <div>
      <div>
        <HeaderBlock />
        <HeadingBlock
          item={{
            style: "centered",
            headline: t("front.brand.title"),
            subheadline: t("front.brand.description"),
          }}
        />
        <div className="bg-background container mx-auto max-w-3xl space-y-6 py-8">
          <div className="space-y-2">
            <div className="font-black">{t("shared.icon")}</div>
            <PreviewIcon />
          </div>
          <div className="space-y-2">
            <div className="font-black">{t("shared.logo")}</div>
            <PreviewLogo />
          </div>
        </div>
        <FooterBlock />
      </div>
    </div>
  );
}
