"use client";

import { useParams } from "next/navigation";
import { useFormState, useFormStatus } from "react-dom";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { executeWorkflow, continueWorkflowExecution } from "@/modules/workflowEngine/services/WorkflowExecutionActions";
import MonacoEditor from "@/components/editors/MonacoEditor";
import BreadcrumbSimple from "@/components/ui/breadcrumbs/BreadcrumbSimple";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText from "@/components/ui/input/InputText";
import WorkflowInputExamplesDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowInputExamplesDropdown";
import WorkflowRunDropdown from "@/modules/workflowEngine/components/workflows/buttons/WorkflowRunDropdown";
import WorkflowUtils from "@/modules/workflowEngine/helpers/WorkflowUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import { WorkflowsIdRunApiApi } from "./workflows.$id.run.api.server";
import clsx from "clsx";
import { WorkflowExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowExecutionDto";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";

type ExecuteWorkflowState = {
  success?: string;
  error?: string;
  execution?: WorkflowExecutionDto;
} | null;

type ContinueWorkflowState = {
  success?: boolean;
  error?: string;
} | null;

function SubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <LoadingButton type="submit" disabled={disabled || pending}>
      {children}
    </LoadingButton>
  );
}

function ContinueButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={disabled || pending}
      className="inline-flex items-center rounded border border-border px-1 font-sans text-xs text-muted-foreground"
    >
      <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    </button>
  );
}

export default function WorkflowsIdRunApiApiView({ data }: { data: WorkflowsIdRunApiApi.LoaderData }) {
  const params = useParams();
  const [executeState, executeFormAction] = useFormState<ExecuteWorkflowState, FormData>(executeWorkflow, null);
  const [continueState, continueFormAction] = useFormState<ContinueWorkflowState, FormData>(continueWorkflowExecution, null);

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
  }, [data]);

  useEffect(() => {
    if (executeState?.error) {
      toast.error(executeState.error);
    } else if (executeState?.success) {
      toast.success(executeState.success);
    }

    if (executeState?.execution) {
      setExecution(executeState.execution);
    }
  }, [executeState]);

  useEffect(() => {
    if (continueState?.error) {
      toast.error(continueState.error);
    } else if (continueState?.success) {
      toast.success("Workflow continued successfully");
    }
  }, [continueState]);

  function onExecute() {
    const form = new FormData();
    form.append("workflowId", data.workflow.id);
    form.append("input", inputData);
    executeFormAction(form);
  }

  function onSubmitWaitingBlock(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    form.set("executionId", execution?.id ?? "");
    form.set("input", waitingBlockInput);
    continueFormAction(form);
    setWaitingBlockInput("");
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
          <div className="text-lg font-semibold">Run Workflow using the API</div>
        </div>

        {!execution ? (
          <form action={executeFormAction}>
            <input type="hidden" name="workflowId" value={data.workflow.id} />
            <input type="hidden" name="input" value={inputData} />
            <div className="space-y-1">
              <div className="flex items-center justify-between space-x-2">
                <div className="text-sm font-medium">{selectedTemplate || "Body"}</div>
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
              <InputText title="URL" defaultValue={`/api/workflows/run/${data.workflow.id}`} readOnly />
              <InputText title="Method" defaultValue="POST" readOnly />
              <InputText title="Header: X-Api-Key" defaultValue="Your API key" readOnly />
            </div>
            <div className="flex justify-end pt-2">
              <SubmitButton disabled={!WorkflowUtils.canRun(data.workflow)}>
                Run {!WorkflowUtils.canRun(data.workflow) && <span className="ml-1 text-xs opacity-50"> (not live)</span>}
              </SubmitButton>
            </div>
          </form>
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

            <div className="overflow-hidden rounded-md border border-border">
              <MonacoEditor className="h-40" theme="vs-dark" value={JSON.stringify({ execution }, null, 2)} hideLineNumbers tabSize={2} language="json" />
            </div>

            {execution.waitingBlock && (
              <form action={continueFormAction}>
                <input type="hidden" name="executionId" value={execution?.id ?? ""} />
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
                        "focus:ring-theme-600 block w-full rounded-md border-0 py-3 pr-14 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-muted-foreground focus:ring-2 focus:ring-inset sm:text-sm sm:leading-6",
                        "bg-white"
                      )}
                      placeholder={execution.waitingBlock.input.placeholder}
                      required
                    />
                    <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
                      <ContinueButton />
                    </div>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}

        {(executeState?.error || continueState?.error) && (
          <ErrorBanner title="Error">
            <div>{executeState?.error || continueState?.error}</div>
            {(executeState?.error === "No valid API key found" || continueState?.error === "No valid API key found") && params.tenant && (
              <div>
                <Link className="underline" target="_blank" href={UrlUtils.currentTenantUrl(params, "settings/api/keys")}>
                  Click here to create a new API key.
                </Link>
              </div>
            )}
          </ErrorBanner>
        )}
      </div>
    </div>
  );
}
