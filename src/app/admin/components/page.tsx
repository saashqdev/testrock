import { Metadata } from "next";
import AllComponentsList from "@/components/ui/AllComponentsList";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("admin.components.title")} | ${process.env.APP_NAME}`,
  };
}

export default async function AdminComponentsPage() {
  const { t } = await getServerTranslations();
  
  return (
    <div>
      <div className="border-border bg-background w-full border-b py-2 shadow-2xs">
        <div className="mx-auto flex max-w-5xl items-center justify-between space-x-2 px-4 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-(--breakpoint-2xl)">
          <h1 className="flex flex-1 items-center truncate font-bold">{t("admin.components.title")}</h1>
        </div>
      </div>
      <div className="mx-auto max-w-5xl space-y-2 px-4 pt-2 sm:px-6 lg:px-8 xl:max-w-7xl 2xl:max-w-(--breakpoint-2xl)">
        <AllComponentsList withSlideOvers={true} />
      </div>
    </div>
  );
}
