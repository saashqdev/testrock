"use server";

import { getServerTranslations } from "@/i18n/server";
import { subscribe } from "@/modules/pageBlocks/blocks/marketing/pricing/PricingBlockService.server";

export async function actionPricing(prev: any, formData: FormData) {
  const { t } = await getServerTranslations();
  const action = formData.get("action");
  if (action === "subscribe") {
    try {
      const response = await subscribe({ form: formData, t });
      return response;
    } catch (error: any) {
      return { error: error.message || "An error occurred" };
    }
  }
  return { error: "Invalid action" };
}
