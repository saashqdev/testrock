"use server";

import { subscribe } from "@/modules/pageBlocks/components/blocks/marketing/pricing/PricingBlockService.server";
import { getServerTranslations } from "@/i18n/server";
import { headers } from "next/headers";

type ActionData = { error?: string; success?: string; authRequired?: boolean };

export async function subscribeAction(formData: FormData): Promise<ActionData> {
  const headersList = await headers();
  
  // Create a Request object from Next.js headers
  const request = new Request("http://localhost:3000/", {
    method: "POST",
    headers: headersList,
    body: formData,
  });

  try {
    const { t } = await getServerTranslations();
    const response = await subscribe({ 
      request, 
      params: {}, 
      form: formData, 
      t 
    });
    
    // Convert Response to ActionData
    if (response instanceof Response) {
      const data = await response.json();
      return data as ActionData;
    }
    return (response as unknown) as ActionData;
  } catch (error) {
    console.error("Subscribe action error:", error);
    return { 
      error: error instanceof Error ? error.message : "An error occurred during subscription" 
    };
  }
}
