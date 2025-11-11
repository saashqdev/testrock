"use client";

import { useFormStatus } from "react-dom";
import { useActionState } from "react";
import clsx from "clsx";
import { useEffect, useRef, useState } from "react";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { WorkflowBlockTypes } from "@/modules/workflowEngine/dtos/WorkflowBlockTypes";
import { WorkflowExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowExecutionDto";
import { useEventSource } from "@/utils/stream/use-event-source";
import { continueWorkflowExecution } from "@/modules/workflowEngine/services/WorkflowExecutionActions";

interface Props {
  workflowExecutionId: string;
  onCompleted: () => void;
}
export default function WorkflowStreamProgress({ workflowExecutionId, onCompleted }: Props) {
  const [actionState, formAction] = useActionState(continueWorkflowExecution, null);

  const lastBlockExecution = useEventSource(`/api/workflows/stream/${workflowExecutionId}`);

  const [execution, setExecution] = useState<WorkflowExecutionDto | null>(null);
  const [waitingBlockInput, setWaitingBlockInput] = useState("");

  const waitingForInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setTimeout(() => {
      waitingForInputRef.current?.focus();
    }, 100);
  }, [lastBlockExecution]);

  useEffect(() => {
    try {
      if (lastBlockExecution) {
        let execution = JSON.parse(lastBlockExecution) as WorkflowExecutionDto;
        if (execution.status === "running" || execution.status === "waitingBlock") {
          onCompleted();
        }
        setExecution(execution);
      }
    } catch (e) {
      // eslint-disable-next-line no-console
      console.error(e);
    }
  }, [lastBlockExecution, onCompleted]);

  // Reset input when form action succeeds
  useEffect(() => {
    if (actionState?.success) {
      setWaitingBlockInput("");
    }
  }, [actionState]);

  // Form component that uses useFormStatus
  function WaitingBlockForm() {
    const { pending } = useFormStatus();

    return (
      <div className="space-y-1">
        {execution?.waitingBlock?.input.title && <label className="text-xs font-medium text-muted-foreground">{execution.waitingBlock.input.title}</label>}
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
              pending ? "base-spinner bg-secondary/90" : "bg-white"
            )}
            placeholder={execution?.waitingBlock?.input.placeholder}
            required
            disabled={pending}
          />
          <input type="hidden" name="executionId" value={execution?.id ?? ""} />
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <button
              type="submit"
              disabled={pending}
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
        {actionState?.error && <div className="mt-1 text-sm text-red-600">{actionState.error}</div>}
      </div>
    );
  }

  // useEffect(() => {
  //   setBlockExecutions((blockExecutions) => {
  //     if (!lastBlockExecution) {
  //       return blockExecutions;
  //     }
  //     const data = JSON.parse(lastBlockExecution) as WorkflowStreamProgressDto;
  //     const existing = blockExecutions.find((item) => item.blockExecution.id === data.blockExecution.id);
  //     if (existing) {
  //       return blockExecutions;
  //     }

  //     if (data.result && data.block?.type === "alertUser") {
  //       let { type, message } = data.result.output;
  //       if (message) {
  //         if (type === "error") {
  //           toast.error(message, {
  //             position: "bottom-right",
  //             duration: 10000,
  //           });
  //         } else {
  //           toast.success(message, {
  //             position: "bottom-right",
  //             duration: 10000,
  //           });
  //         }
  //       }
  //     }
  //     if (data.workflowCompleted) {
  //       onCompleted();
  //     }
  //     return [...blockExecutions, data];
  //   });
  // }, [lastBlockExecution, onCompleted]);

  return (
    <div>
      <div className="space-y-4">
        {execution?.blockRuns.map((blockRun, index) => {
          const workflowBlock = WorkflowBlockTypes.find((f) => f.value === blockRun.workflowBlock.type);
          if (!workflowBlock) {
            return <div key={index}>Unknown block type: {blockRun.workflowBlock.type}</div>;
          }
          return (
            <div key={index} className="cursor-pointer select-none overflow-hidden rounded-md border border-border bg-white p-2 hover:bg-gray-50">
              <div className="flex justify-between space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="flex items-center space-x-2 truncate">
                    <workflowBlock.icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                    <div className="flex-shrink-0 truncate text-xs font-medium text-muted-foreground">[{workflowBlock.name}]</div>
                    {blockRun.error ? (
                      <div className="truncate text-xs text-red-600">{blockRun.error}</div>
                    ) : blockRun.output ? (
                      <div className="truncate text-xs text-muted-foreground">{JSON.stringify({ output: blockRun.output })}</div>
                    ) : null}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {blockRun.workflowBlock.type === "if" ? (
                    <div>
                      {blockRun.output?.condition ? <SimpleBadge title="True" color={Colors.BLUE} /> : <SimpleBadge title="False" color={Colors.ORANGE} />}
                    </div>
                  ) : blockRun.workflowBlock.type === "switch" ? (
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
          );
        })}

        {execution?.waitingBlock && (
          <form action={formAction}>
            <WaitingBlockForm />
          </form>
        )}
      </div>
    </div>
  );
}
