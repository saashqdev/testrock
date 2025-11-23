import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { load } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockService.server";
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
  const { t } = await getServerTranslations();
  
  // Create a request object for the pricing loader
  const request = new Request(new URL("http://localhost/pricing"));
  const pricingData = await load({ request, params: {}, t });
  
  if (!pricingData) {
    return <div>Error loading pricing data</div>;
  }
  
  return <PricingPage pricingData={pricingData} />;
}
