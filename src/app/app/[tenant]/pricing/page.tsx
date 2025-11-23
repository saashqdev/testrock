"use server";

import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import { load, subscribe } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockService.server";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { defaultPricingPage } from "@/modules/pageBlocks/pages/defaultPages/defaultPricingPage";
import { revalidatePath } from "next/cache";
import { requireTenantSlug } from "@/lib/services/url.server";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return {
    title: t("front.pricing.title") + " | " + process.env.APP_NAME,
    description: t("front.pricing.headline"),
  };
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params;
  const { t } = await getServerTranslations();

  // Validate tenant access
  await requireTenantSlug();

  const request = new Request(props.request?.url || "http://localhost", {
    headers: props.request?.headers,
  });

  const pricingBlockData = await load({ request, params: params || {}, t });
  
  return {
    pricingBlockData,
  };
};

export const actionAppPricing = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "subscribe") {
    const request = new Request("http://localhost", {
      method: "POST",
      body: form,
    });
    const response = await subscribe({ request, params: {}, t, form });
    revalidatePath("/pricing");
    return response;
  }
};

export default async function (props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await loader(props);
  
  const blocks = defaultPricingPage({ t });
  // Inject the loaded pricing data into the pricing block
  const blocksWithData = blocks.map((block) => {
    if (block.pricing) {
      return { ...block, pricing: { ...block.pricing, data: data.pricingBlockData } };
    }
    return block;
  });
  
  return <PageBlocks items={blocksWithData} />;
}
