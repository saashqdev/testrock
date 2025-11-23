"use server";

import { getServerTranslations } from "@/i18n/server";
import { subscribe } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockService.server";

export async function actionPricing(prev: any, formData: FormData) {
  const { t } = await getServerTranslations();
  const action = formData.get("action");
  if (action === "subscribe") {
    try {
      // Create a mock request object for the subscribe function
      const request = new Request("http://localhost/pricing", {
        method: "POST",
        body: formData,
      });
      const response = await subscribe({ request, params: {}, form: formData, t });
      return response;
    } catch (error: any) {
      return { error: error.message || "An error occurred" };
    }
  }
  return { error: "Invalid action" };
}
