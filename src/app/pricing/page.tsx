import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { load } from "@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import PricingPage from "./PricingPage";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("front.pricing.title")} | ${process.env.APP_NAME}`,
    description: t("front.pricing.headline"),
  };
}

export default async function Page(props: IServerComponentsProps) {
  // Don't read searchParams here to avoid re-rendering on client-side URL changes
  const pricingData = await load({ searchParams: undefined });
  
  if (!pricingData) {
    return <div>Error loading pricing data</div>;
  }
  
  return <PricingPage pricingData={pricingData} />;
}
