import { getServerTranslations } from "@/i18n/server";
import CrmService from "@/modules/crm/services/CrmService";
import { NewsletterPage } from "@/modules/pageBlocks/pages/NewsletterPage";
import NewsletterClient from "./newsletter-client";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return await NewsletterPage.metatags({ t });
}

export default async function Newsletter() {
  const { t } = await getServerTranslations();
  
  // Fetch newsletter form settings
  const settings = await CrmService.getNewsletterFormSettings();
  
  // Get page blocks from NewsletterPage configuration
  const blocks = NewsletterPage.blocks({ t });

  return (
    <NewsletterClient 
      data={{
        blocks,
        settings,
      }}
    />
  );
}
