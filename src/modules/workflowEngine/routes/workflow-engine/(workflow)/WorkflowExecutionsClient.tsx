"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import WorkflowBuilder from "@/modules/workflowEngine/components/workflows/WorkflowBuilder";
import WorkflowExecutionsSidebar from "@/modules/workflowEngine/components/workflows/WorkflowExecutionsSidebar";
import { WorkflowBlockDto } from "@/modules/workflowEngine/dtos/WorkflowBlockDto";
import { WorkflowDto } from "@/modules/workflowEngine/dtos/WorkflowDto";
import { WorkflowExecutionDto } from "@/modules/workflowEngine/dtos/WorkflowExecutionDto";

interface WorkflowExecutionsClientProps {
  workflow: WorkflowDto;
  executions: WorkflowExecutionDto[];
}

export default function WorkflowExecutionsClient({ workflow, executions }: WorkflowExecutionsClientProps) {
  const [searchParams] = useSearchParams();
  const [selectedExecution, setSelectedExecution] = useState<WorkflowExecutionDto | null>(null);
  const [selectedBlock, setSelectedBlock] = useState<WorkflowBlockDto | null>(null);

  useEffect(() => {
    const newSearchParams = new URLSearchParams(searchParams?.toString() || "");
    const executionId = newSearchParams.get("executionId");
    if (executionId) {
      const execution = executions.find((x) => x.id === executionId);
      if (execution) {
        setSelectedExecution(execution);
      }
    } else {
      setSelectedExecution(null);
    }
  }, [executions, searchParams]);

  return (
    <div className="flex h-[calc(100vh-140px)]">
      <div className="flex-1">
        <WorkflowBuilder
          key={selectedExecution?.id}
          readOnly={true}
          workflow={workflow}
          selectedBlock={selectedBlock}
          workflowExecution={selectedExecution}
          onSelectedBlock={setSelectedBlock}
        />
      </div>
      <div className="w-96 overflow-y-auto border-l border-border bg-background">
        <WorkflowExecutionsSidebar
          key={selectedExecution?.id}
          workflow={workflow}
          selectedBlock={selectedBlock}
          selectedExecution={selectedExecution}
          executions={executions}
          onSelectedBlock={setSelectedBlock}
          onSelectedExecution={setSelectedExecution}
        />
      </div>
    </div>
  );
}
