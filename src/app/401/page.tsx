import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import Page401 from "@/components/pages/Page401";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.unauthorized")} | ${process.env.APP_NAME}`,
  };
}

export default function UnauthorizedPage() {
  return <Page401 />;
}
