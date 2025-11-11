import { prisma } from "@/db/config/prisma/database";
import { requireAuth } from "@/lib/services/loaders.middleware";
import NumberUtils from "@/lib/shared/NumberUtils";
import { getServerTranslations } from "@/i18n/server";
import { Metadata } from "next";

type LoaderData = {
  summary: {
    feedbackTotal: number;
  };
};

async function getData(): Promise<LoaderData> {
  await requireAuth();
  const data: LoaderData = {
    summary: {
      feedbackTotal: await prisma.feedback.count(),
    },
  };
  return data;
}

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("shared.overview")} | ${process.env.APP_NAME}`,
  };
}

export default async function HelpDeskPage() {
  const { t } = await getServerTranslations();
  const data = await getData();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-border border-b pb-5">
        <h3 className="text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <div className="bg-background overflow-hidden rounded-lg px-4 py-3 shadow">
          <dt className="text-muted-foreground truncate text-xs font-medium uppercase">
            <div>{t("feedback.plural")}</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold">{NumberUtils.intFormat(data.summary.feedbackTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
