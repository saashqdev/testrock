"use client";

import Link from "next/link";
import { useOptimistic, useTransition, useState, useRef, useEffect } from "react";
import clsx from "clsx";
import toast from "react-hot-toast";
import { Colors } from "@/lib/enums/shared/Colors";
import MonacoEditor from "@/components/editors/MonacoEditor";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import WorkflowInputExamplesDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowInputExamplesDropdown";
import WorkflowRunDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowRunDropdown";
import { WorkflowBlockExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowBlockExecutionDto";
import { WorkflowBlockTypes } from "@/modules/workflowEngine/dtos/WorkflowBlockTypes";
import { WorkflowExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowExecutionDto";
import WorkflowUtils from "@/modules/workflowEngine/helpers/WorkflowUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import { WorkflowDto } from "../../../dtos/WorkflowDto";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";

// Type for the loader data that would come from the server component
type WorkflowsIdRunManualLoaderData = {
  workflow: WorkflowDto;
};

// Server action types
type ActionData = {
  success?: string;
  error?: string;
  execution?: WorkflowExecutionDto;
};

interface Props {
  data: WorkflowsIdRunManualLoaderData;
  params: any;
  executeWorkflow: (formData: FormData) => Promise<ActionData>;
  continueWorkflowExecution: (formData: FormData) => Promise<ActionData>;
}

export default function WorkflowsIdRunManualView({ data, params, executeWorkflow, continueWorkflowExecution }: Props) {
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useOptimistic<ActionData | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [execution, setExecution] = useState<WorkflowExecutionDto | null>(null);
  const [inputData, setInputData] = useState("{}");
  const [waitingBlockInput, setWaitingBlockInput] = useState("");

  const waitingForInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => {
      waitingForInputRef.current?.focus();
    }, 100);
  }, [execution]);

  useEffect(() => {
    if (data.workflow.inputExamples.length > 0) {
      setSelectedTemplate(data.workflow.inputExamples[0].title);
      setInputData(JSON.stringify(data.workflow.inputExamples[0].input, null, 2));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.workflow.inputExamples.length]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }

    if (actionData?.execution) {
      setExecution(actionData.execution);
      actionData?.execution?.executionAlerts.forEach((executionAlert) => {
        if (executionAlert.type === "error") {
          toast.error(executionAlert.message, {
            position: "bottom-right",
            duration: 10000,
          });
        } else {
          toast.success(executionAlert.message, {
            position: "bottom-right",
            duration: 10000,
          });
        }
      });
    }
  }, [actionData]);

  function onExecute() {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("input", inputData);

      const result = await executeWorkflow(formData);
      setActionData(result);
    });
  }

  function onSubmitWaitingBlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("executionId", execution?.id ?? "");

    startTransition(async () => {
      const result = await continueWorkflowExecution(formData);
      setActionData(result);
      setWaitingBlockInput("");
    });
  }

  return (
    <div>
      <div className="shadow-2xs w-full border-b border-border bg-background px-4 py-2">
        <BreadcrumbSimple
          menu={[{ title: "Workflows", routePath: UrlUtils.getModulePath(params, `workflow-engine/workflows`) }, { title: data.workflow.name }]}
        />
      </div>
      <div className="shadow-2xs w-full border-b border-border bg-background px-4 py-2">
        <div className="flex justify-between">
          <Link
            href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${data.workflow.id}/executions`)}
            className="shadow-2xs rounded bg-background px-2 py-1 text-sm font-semibold text-foreground/80 ring-1 ring-inset ring-gray-300 hover:bg-secondary"
          >
            <span className="mr-1">&larr;</span> Back to executions
          </Link>
          <WorkflowRunDropdown workflow={data.workflow} />
        </div>
      </div>
      <div className="mx-auto max-w-2xl space-y-2 p-4">
        <div className="flex justify-between space-x-2">
          <div className="text-lg font-semibold">Run Workflow Manually</div>
        </div>

        {!execution ? (
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
              <LoadingButton isLoading={isPending} onClick={onExecute} disabled={!WorkflowUtils.canRun(data.workflow)}>
                Run {!WorkflowUtils.canRun(data.workflow) && <span className="ml-1 text-xs opacity-50"> (not live)</span>}
              </LoadingButton>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Link
                target="_blank"
                href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${data.workflow.id}/executions?executionId=${execution.id}`)}
                className="flex w-full flex-col items-center rounded-lg border-2 border-dotted border-border bg-background p-3 text-sm font-medium hover:border-dashed hover:border-border"
              >
                <>
                  <div className="flex justify-center">
                    <div className=" ">View execution flow</div>
                  </div>
                </>
              </Link>
              <button
                type="button"
                onClick={() => {
                  setExecution(null);
                }}
                className="flex w-full flex-col items-center rounded-lg border-2 border-dotted border-border bg-background p-3 text-sm font-medium hover:border-dashed hover:border-border"
              >
                <div className="flex justify-center">
                  <div className=" ">Run again</div>
                </div>
              </button>
            </div>
            <WorkflowRun workflow={execution} />
            <div className="font-medium text-foreground">Blocks executed ({execution.blockRuns.length})</div>
            <div className="w-full space-y-1">
              {execution.blockRuns.map((blockRun) => {
                return <BlockRun key={blockRun.id} workflow={data.workflow} blockRun={blockRun} />;
              })}
            </div>
            {execution.waitingBlock && (
              <form onSubmit={onSubmitWaitingBlock}>
                <div className="space-y-1">
                  {execution.waitingBlock.input.title && (
                    <label className="text-xs font-medium text-muted-foreground">{execution.waitingBlock.input.title}</label>
                  )}
                  <div className="relative flex items-center">
                    <input
                      ref={waitingForInputRef}
                      autoFocus
                      type="text"
                      name="input"
                      id="input"
                      autoComplete="off"
                      value={waitingBlockInput}
                      onChange={(e) => setWaitingBlockInput(e.currentTarget.value)}
                      className={clsx(
                        "block w-full rounded-md border-0 py-3 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset focus:ring-theme-600 sm:text-sm sm:leading-6",
                        isPending ? "base-spinner bg-secondary/90" : "bg-white"
                      )}
                      placeholder={execution.waitingBlock.input.placeholder}
                      required
                      disabled={isPending}
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="inline-flex items-center rounded border border-border px-1 font-sans text-xs text-muted-foreground"
                      >
                        <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {actionData?.error && <ErrorBanner title="Error" text={actionData.error} />}
      </div>
    </div>
  );
}

function BlockRun({ workflow, blockRun }: { workflow: WorkflowDto; blockRun: WorkflowBlockExecutionDto }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const block = workflow.blocks.find((x) => x.id === blockRun.workflowBlockId);
  const workflowBlock = WorkflowBlockTypes.find((x) => x.value === block?.type);
  if (!block || !workflowBlock) {
    return null;
  }
  return (
    <div className="space-y-0">
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        className={clsx(
          "cursor-pointer select-none overflow-hidden rounded-md border border-border bg-background p-2 hover:bg-secondary",
          isExpanded ? "rounded-b-none" : "rounded-md"
        )}
      >
        <div className="flex justify-between space-x-2">
          <div className="flex items-center space-x-1 truncate">
            <div className="flex items-center space-x-2 truncate">
              <workflowBlock.icon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="shrink-0 truncate text-xs font-medium text-foreground/80">[{workflowBlock.name}]</div>
              {blockRun.error ? (
                <div className="truncate text-xs text-red-600">{blockRun.error}</div>
              ) : blockRun.output ? (
                <div className="truncate text-xs text-muted-foreground">{JSON.stringify({ output: blockRun.output })}</div>
              ) : null}
            </div>
            <div className="text-sm text-muted-foreground">{block.description || ""}</div>
          </div>

          <div className="shrink-0">
            {block.type === "if" ? (
              <div>{blockRun.output?.condition ? <SimpleBadge title="True" color={Colors.BLUE} /> : <SimpleBadge title="False" color={Colors.ORANGE} />}</div>
            ) : block.type === "switch" ? (
              <SimpleBadge title={blockRun.output?.condition?.toString()} color={Colors.BLUE} />
            ) : (
              <div>
                {blockRun.status === "running" ? (
                  <SimpleBadge title="Running" color={Colors.YELLOW} />
                ) : blockRun.status === "error" ? (
                  <SimpleBadge title="Error" color={Colors.RED} />
                ) : blockRun.status === "success" ? (
                  <SimpleBadge title="Success" color={Colors.GREEN} />
                ) : (
                  <SimpleBadge title="Unknown Status" color={Colors.GRAY} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {isExpanded && (
        <div onClick={(e) => e.preventDefault()} className="overflow-hidden rounded-md rounded-t-none border border-border bg-secondary/90 p-2">
          {blockRun.error && <ErrorBanner title="Error" text={blockRun.error} />}
          <InputOutput input={blockRun.input} output={blockRun.output} />
        </div>
      )}
    </div>
  );
}

function WorkflowRun({ workflow }: { workflow: WorkflowExecutionDto }) {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className="space-y-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full flex-col items-center rounded-lg border-2 border-dotted border-border bg-background p-3 text-sm font-medium hover:border-dashed hover:border-border"
      >
        <div className="flex justify-center"> Workflow Input and Output</div>
      </button>
      {isExpanded && (
        <div onClick={(e) => e.preventDefault()} className="overflow-hidden rounded-md border border-border bg-secondary/90 p-2">
          <InputOutput input={workflow.input} output={workflow.output} />
        </div>
      )}
    </div>
  );
}

function InputOutput({ input, output }: { input?: any; output?: any }) {
  return (
    <div className="space-y-1">
      {!input || JSON.stringify(input) === "{}" ? (
        <div className="flex flex-col items-center border border-border bg-gray-200 p-3">
          <div className="text-center text-xs text-muted-foreground">No input</div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between space-x-2">
            <div className="text-xs font-medium text-foreground/80">Input</div>
            <button
              type="button"
              className="text-xs font-medium text-foreground/80 hover:text-muted-foreground"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(input))}
            >
              Copy
            </button>
          </div>
          <div className="prose max-h-24 overflow-auto">
            <pre>{JSON.stringify(input, null, 2)}</pre>
          </div>
        </div>
      )}

      {!output || JSON.stringify(output) === "{}" ? (
        <div className="flex flex-col items-center border border-border bg-gray-200 p-3">
          <div className="text-center text-xs text-muted-foreground">No output</div>
        </div>
      ) : (
        <div className="space-y-1">
          <div className="flex items-center justify-between space-x-2">
            <div className="text-xs font-medium text-foreground/80">Outputs</div>
            <button
              type="button"
              className="text-xs font-medium text-foreground/80 hover:text-muted-foreground"
              onClick={() => navigator.clipboard.writeText(JSON.stringify(output))}
            >
              Copy
            </button>
          </div>
          <div className="prose max-h-24 overflow-auto">
            <pre>{JSON.stringify(output, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
}
