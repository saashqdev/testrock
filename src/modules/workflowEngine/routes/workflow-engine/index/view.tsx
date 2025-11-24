import NumberUtils from "@/lib/shared/NumberUtils";
import { LoaderData } from "./api/server";

export default function WorkflowEngineIndexView({ data }: { data: LoaderData }) {
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6 text-foreground">Overview</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-2">
        <SummaryCard title="Workflows" value={data.summary.workflowsTotal} />
        <SummaryCard title="Executions" value={data.summary.executionsTotal} />
        <SummaryCard title="Credentials" value={data.summary.credentialsTotal} />
        <SummaryCard title="Variables" value={data.summary.variablesTotal} />
      </dl>
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="shadow-xs overflow-hidden rounded-lg border border-border bg-card px-4 py-3">
      <dt className="truncate text-xs font-medium uppercase text-muted-foreground">
        <div>{title}</div>
      </dt>
      <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(value)}</dd>
    </div>
  );
}
