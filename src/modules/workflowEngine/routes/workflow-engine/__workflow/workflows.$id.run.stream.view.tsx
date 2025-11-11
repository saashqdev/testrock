"use client";

import Link from "next/link";
import { useEffect, useState, useActionState } from "react";
import toast from "react-hot-toast";
import MonacoEditor from "@/components/editors/MonacoEditor";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import WorkflowInputExamplesDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowInputExamplesDropdown";
import WorkflowRunDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowRunDropdown";
import WorkflowStreamProgress from "@/modules/workflowEngine/components/workflows/stream/WorkflowStreamProgress";
import WorkflowUtils from "@/modules/workflowEngine/helpers/WorkflowUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { useParams } from "next/navigation";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";

export type WorkflowsIdRunStreamLoaderData = {
  metatags: MetaTagsDto;
  workflow: WorkflowDto;
};

export type WorkflowsIdRunStreamActionData = {
  success?: string;
  error?: string;
  executionId?: string;
};

interface WorkflowsIdRunStreamViewProps {
  data: WorkflowsIdRunStreamLoaderData;
  workflowAction: (prev: any, formData: FormData) => Promise<WorkflowsIdRunStreamActionData>;
}

export default function WorkflowsIdRunStreamView({ data, workflowAction }: WorkflowsIdRunStreamViewProps) {
  const [actionData, action, pending] = useActionState(workflowAction, null);
  const params = useParams();

  const [executionId, setExecutionId] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [inputData, setInputData] = useState("{}");
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (data.workflow.inputExamples.length > 0) {
      setSelectedTemplate(data.workflow.inputExamples[0].title);
      setInputData(JSON.stringify(data.workflow.inputExamples[0].input, null, 2));
    }
  }, [data]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
    if (actionData?.executionId) {
      setExecutionId(actionData.executionId);
      setIsRunning(true);
    }
  }, [actionData]);

  function onExecute() {
    const form = new FormData();
    form.append("action", "execute");
    form.append("input", inputData);
    action(form);
  }
  return (
    <div>
      <div className="w-full border-b border-border bg-white px-4 py-2 shadow-sm">
        <BreadcrumbSimple
          menu={[{ title: "Workflows", routePath: UrlUtils.getModulePath(params, `workflow-engine/workflows`) }, { title: data.workflow.name }]}
        />
      </div>
      <div className="w-full border-b border-border bg-white px-4 py-2 shadow-sm">
        <div className="flex justify-between">
          <Link
            href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${data.workflow.id}/executions`)}
            className="rounded bg-white px-2 py-1 text-sm font-semibold text-muted-foreground shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            <span className="mr-1">&larr;</span> Back to executions
          </Link>
          <WorkflowRunDropdown workflow={data.workflow} />
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-2 p-4">
        <div className="flex justify-between space-x-2">
          <div className="text-lg font-semibold">Run Workflow in Streaming Mode</div>
        </div>
        <div>
          <div className="space-y-1">
            <div className="flex items-center justify-between space-x-2">
              <div className="text-sm font-medium">{selectedTemplate || "Input Data"}</div>
              {data.workflow.inputExamples.length > 0 && (
                <WorkflowInputExamplesDropdown
                  workflow={data.workflow}
                  onSelected={(item) => {
                    setSelectedTemplate(item.title);
                    setInputData(JSON.stringify(item.input, null, 2));
                  }}
                />
              )}
            </div>
            <div className="overflow-hidden rounded-md border border-border">
              <MonacoEditor className="h-20" theme="light" value={inputData} onChange={setInputData} hideLineNumbers tabSize={2} language="json" />
            </div>
          </div>
          <div className="flex justify-end pt-2">
            <LoadingButton onClick={onExecute} disabled={!WorkflowUtils.canRun(data.workflow)} isLoading={isRunning || pending}>
              Run {!WorkflowUtils.canRun(data.workflow) && <span className="ml-1 text-xs opacity-50"> (not live)</span>}
            </LoadingButton>
          </div>
        </div>

        {executionId && <WorkflowStreamProgress key={executionId} workflowExecutionId={executionId} onCompleted={() => setIsRunning(false)} />}

        {actionData?.error && <ErrorBanner title="Error" text={actionData.error} />}
      </div>
    </div>
  );
}
