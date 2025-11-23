import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { load } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockService.server";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import { defaultLandingPage } from "@/modules/pageBlocks/pages/defaultPages/defaultLandingPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("front.hero.headline1")} | ${process.env.APP_NAME}`,
    description: t("front.hero.headline2"),
  };
}

export default async function (props: IServerComponentsProps) {
  // Don't read searchParams to prevent page re-render on URL changes (causes scroll jumping)
  const { t } = await getServerTranslations();

  // Create a mock request for the pricing loader
  const request = new Request(new URL("http://localhost/pricing"));
  const pricingBlockData = await load({ request, params: {}, t });

  // Generate blocks on server to prevent hydration mismatch
  const blocks = defaultLandingPage({ t, pricingData: pricingBlockData });

  return <PageBlocks items={blocks} />;
}
