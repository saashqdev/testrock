import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { load } from "@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server";
import PageBlocks from "@/modules/pageBlocks/blocks/PageBlocks";
import { metatags, blocks } from "@/modules/pageBlocks/pages/LandingPage";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return await metatags({ t });
}

export default async function (props: IServerComponentsProps) {
  const searchParams = await props.searchParams;
  const { t } = await getServerTranslations();
  const pricingBlockData = await load({ searchParams });
  return <PageBlocks items={blocks({ data: { pricingBlockData }, t })} />;
}
