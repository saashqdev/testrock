"use server";

import PageBlocks from "@/modules/pageBlocks/blocks/PageBlocks";
import { load, subscribe } from "@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server";
import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { LoaderData, metatags, blocks } from "@/modules/pageBlocks/pages/PricingPage";
import { revalidatePath } from "next/cache";
import { requireTenantSlug } from "@/lib/services/url.server";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return metatags({ t });
}

const loader = async (props: IServerComponentsProps) => {
  const params = await props.params;
  const searchParams = await props.searchParams;
  const { t } = await getServerTranslations();
  
  // Validate tenant access
  await requireTenantSlug();

  const data: LoaderData = {
    metatags: metatags({ t }),
    pricingBlockData: await load({ searchParams }),
  };
  return data;
};

export const actionAppPricing = async (prev: any, form: FormData) => {
  const { t } = await getServerTranslations();
  const action = form.get("action");
  if (action === "subscribe") {
    const response = await subscribe({ form, t });
    revalidatePath("/pricing");
    return response;
  }
};

export default async function (props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await loader(props);
  return <PageBlocks items={blocks({ data, t })} />;
}
