import { getServerTranslations } from "@/i18n/server";
import PageBlocks from "@/modules/pageBlocks/blocks/PageBlocks";
import { load, metatags, blocks } from "@/modules/pageBlocks/pages/ContactPage";

export async function generateMetadata() {
  const { t } = await getServerTranslations();
  return await metatags({ t });
}

export default async function Contact() {
  const { t } = await getServerTranslations();
  const data = await load();
  return <PageBlocks items={blocks({ t, data })} />;
}
