"use client";

import { Fragment } from "react";
import { WorkflowDto } from "../../dtos/WorkflowDto";
import { WorkflowExecutionDto } from "../../dtos/WorkflowExecutionDto";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import WorkflowBlockExecution from "./WorkflowBlockExecution";
import { WorkflowBlockExecutionDto } from "../../dtos/WorkflowBlockExecutionDto";
import clsx from "clsx";
import DateCell from "@/components/ui/dates/DateCell";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { WorkflowBlockDto } from "../../dtos/WorkflowBlockDto";
import { Editor } from "@monaco-editor/react";
import DateUtils from "@/lib/shared/DateUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";

interface Props {
  workflow: WorkflowDto;
  selectedBlock: WorkflowBlockDto | null;
  selectedExecution: WorkflowExecutionDto | null;
  executions: WorkflowExecutionDto[];
  onSelectedBlock: (node: WorkflowBlockDto | null) => void;
  onSelectedExecution: (execution: WorkflowExecutionDto | null) => void;
}
export default function WorkflowExecutionsSidebar({ workflow, selectedBlock, selectedExecution, executions, onSelectedBlock, onSelectedExecution }: Props) {
  const [searchParams, setSearchParams] = useSearchParams();
  const newSearchParams = new URLSearchParams(String(searchParams));
  const router = useRouter();
  let content;
  if (!selectedBlock && !selectedExecution) {
    content = (
      <ExecutePanel
        workflow={workflow}
        executions={executions}
        selectedExecution={selectedExecution}
        onSelected={(item) => {
          newSearchParams.set("executionId", item.id);
          router.push(String(newSearchParams));
        }}
      />
    );
  } else if (!selectedBlock && selectedExecution) {
    content = (
      <div>
        <div className="">
          <div className="flex h-12 justify-between border-b border-border px-4 py-3 pr-6">
            <button
              type="button"
              className="focus:outline-hidden rounded-md bg-background text-muted-foreground hover:text-muted-foreground focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              onClick={() => {
                onSelectedBlock(null);
                newSearchParams.delete("executionId");
                router.push(String(newSearchParams));
              }}
            >
              <span className="sr-only">Close panel</span>
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
          </div>
          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <div className="space-y-1">
                <div className="flex items-center justify-between space-x-2 border-b border-dashed border-border pb-1">
                  <div className="text-xs font-medium">Status:</div>
                  <div className="text-sm">{selectedExecution.status}</div>
                </div>
                <div className="flex items-center justify-between space-x-2 border-b border-dashed border-border pb-1">
                  <div className="text-xs font-medium">Created at:</div>
                  <div className="text-sm">{DateUtils.dateYMDHMS(selectedExecution.createdAt)}</div>
                </div>
                <div className="flex items-center justify-between space-x-2 border-b border-dashed border-border pb-1">
                  <div className="text-xs font-medium">Ended at:</div>
                  <div className="text-sm">{DateUtils.dateYMDHMS(selectedExecution.endedAt)}</div>
                </div>
                <div className="flex items-center justify-between space-x-2 border-b border-dashed border-border pb-1">
                  <div className="text-xs font-medium">Duration:</div>
                  <div className="text-sm">{DateUtils.getDurationInSeconds({ start: selectedExecution.createdAt, end: selectedExecution.endedAt })}</div>
                </div>
              </div>
            </div>

            {selectedExecution.error && <ErrorBanner title="Error" text={selectedExecution.error} />}

            <Fragment>
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground/80">Workflow Params</div>
                <div className="space-y-1">
                  <div className="overflow-hidden">
                    {typeof window !== "undefined" && (
                      <Editor
                        value={selectedExecution.input ? JSON.stringify(selectedExecution.input, null, 2) : "{}"}
                        language="json"
                        options={{
                          fontSize: 12,
                          renderValidationDecorations: "off",
                          wordWrap: "on",
                          unusualLineTerminators: "off",
                          tabSize: 2,
                        }}
                        className="-ml-10 block h-32 w-full min-w-0 flex-1 rounded-md border-border focus:border-border focus:ring-ring sm:text-sm"
                        theme="vs-dark"
                      />
                    )}
                  </div>
                </div>
              </div>
            </Fragment>
            <Fragment>
              <div className="border-t border-border"></div>
              <div className="space-y-3">
                <div className="text-sm font-medium text-foreground/80">Workflow Output</div>
                <div className="space-y-1">
                  <div className="overflow-hidden">
                    <Editor
                      value={selectedExecution.input ? JSON.stringify(selectedExecution.output, null, 2) : "{}"}
                      language="json"
                      options={{
                        fontSize: 12,
                        renderValidationDecorations: "off",
                        wordWrap: "on",
                        unusualLineTerminators: "off",
                        tabSize: 2,
                      }}
                      className="-ml-10 block h-32 w-full min-w-0 flex-1 rounded-md border-border focus:border-border focus:ring-ring sm:text-sm"
                      theme="vs-dark"
                    />
                  </div>
                </div>
              </div>
            </Fragment>
          </div>
        </div>
      </div>
    );
  } else if (selectedBlock) {
    let blockRun: WorkflowBlockExecutionDto | null = null;
    if (selectedExecution) {
      blockRun = selectedExecution.blockRuns.find((x) => x.workflowBlockId === selectedBlock.id) ?? null;
    }
    content = (
      <WorkflowBlockExecution
        key={selectedBlock.id}
        execution={selectedExecution}
        workflow={workflow}
        block={selectedBlock}
        blockRun={blockRun}
        onBack={() => onSelectedBlock(null)}
      />
    );
  }

  return <div className="">{content}</div>;
}

function ExecutePanel({
  workflow,
  executions,
  selectedExecution,
  onSelected,
}: {
  workflow: WorkflowDto;
  executions: WorkflowExecutionDto[];
  selectedExecution: WorkflowExecutionDto | null | undefined;
  onSelected: (execution: WorkflowExecutionDto) => void;
}) {
  const params = useParams();
  return (
    <div className="space-y-4 p-4">
      <div className="space-y-1">
        <div className="flex justify-between space-x-2">
          <div className="font-medium text-foreground">Execute Workflow</div>
        </div>
        <div className="flex flex-col space-y-2">
          <Link href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${workflow.id}/run/manual`)}>
            <div className="rounded-md border border-dashed border-border bg-secondary p-3 hover:border-dotted hover:border-border hover:bg-secondary/90">
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground">Run manually</div>
                <div className="text-xs text-muted-foreground">Set the input data to run the workflow manually.</div>
              </div>
            </div>
          </Link>
          <Link href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${workflow.id}/run/api`)}>
            <div className="rounded-md border border-dashed border-border bg-secondary p-3 hover:border-dotted hover:border-border hover:bg-secondary/90">
              <div className="space-y-1">
                <div className="text-sm font-medium text-foreground">API call</div>
                <div className="text-xs text-muted-foreground">Call the workflow using the API.</div>
              </div>
            </div>
          </Link>
          <Link href={UrlUtils.getModulePath(params, `workflow-engine/workflows/${workflow.id}/run/stream`)}>
            <div className="rounded-md border border-dashed border-border bg-secondary p-3 hover:border-dotted hover:border-border hover:bg-secondary/90">
              <div className="space-y-1">
                <div className="text-sm font-medium text-gray-800">Stream</div>
                <div className="text-xs text-muted-foreground">Get interactive output from the workflow.</div>
              </div>
            </div>
          </Link>
        </div>
      </div>
      <div className="space-y-1 overflow-y-scroll">
        <div className="font-medium">Executions</div>
        {executions.length === 0 ? (
          <div>
            <div className="text-sm text-muted-foreground">No executions yet.</div>
          </div>
        ) : (
          <div className="space-y-0.5 overflow-y-auto">
            {executions.map((execution, idx) => {
              return (
                <div
                  key={idx}
                  className={clsx(
                    "cursor-pointer rounded-md border px-2 py-1.5 hover:bg-secondary/90",
                    selectedExecution?.id === execution.id ? "border-border bg-secondary/90" : "border-transparent bg-background"
                  )}
                  onClick={() => onSelected(execution)}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2 truncate">
                      {/* <div className="text-muted-foreground font-light truncate w-6">#{idx + 1}</div> */}
                      <div className="w-14 font-medium text-foreground/80">
                        <DateCell date={execution.createdAt} displays={["hms"]} />
                      </div>
                      <div className="truncate text-muted-foreground">{execution.blockRuns.length} nodes executed</div>
                    </div>
                    <div>
                      {!execution.endedAt ? (
                        <SimpleBadge title="Incomplete" color={Colors.YELLOW} />
                      ) : execution.error ? (
                        <SimpleBadge title="Error" color={Colors.RED} />
                      ) : (
                        <SimpleBadge title="Success" color={Colors.GREEN} />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
