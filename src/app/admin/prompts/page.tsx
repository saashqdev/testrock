import { prisma } from "@/db/config/prisma/database";
import NumberUtils from "@/lib/shared/NumberUtils";
import { getServerTranslations } from "@/i18n/server";

type LoaderData = {
  summary: {
    flowsTotal: number;
    templatesTotal: number;
    executionsTotal: number;
    resultsTotal: number;
  };
};

async function getData(): Promise<LoaderData> {
  const data: LoaderData = {
    summary: {
      flowsTotal: await prisma.promptFlow.count(),
      templatesTotal: await prisma.promptTemplate.count(),
      executionsTotal: await prisma.promptFlowExecution.count(),
      resultsTotal: await prisma.promptTemplateResult.count(),
    },
  };
  return data;
}

export default async function PromptsPage() {
  const { t } = await getServerTranslations();
  const data = await getData();
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6">{t("shared.overview")}</h3>
      </div>
      <dl className="grid grid-cols-2 gap-2">
        <div className="overflow-hidden rounded-lg bg-background px-4 py-3 shadow">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Prompt Flows</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold">{NumberUtils.intFormat(data.summary.flowsTotal)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-background px-4 py-3 shadow">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Templates</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold">{NumberUtils.intFormat(data.summary.templatesTotal)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-background px-4 py-3 shadow">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Executions</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold">{NumberUtils.intFormat(data.summary.executionsTotal)}</dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-background px-4 py-3 shadow">
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
            <div>Results</div>
          </dt>
          <dd className="mt-1 truncate text-2xl font-semibold">{NumberUtils.intFormat(data.summary.resultsTotal)}</dd>
        </div>
      </dl>
    </div>
  );
}
