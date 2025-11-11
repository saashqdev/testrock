import { WorkflowBlockExecution, WorkflowExecution } from "@prisma/client";
import { WorkflowBlockWithDetailsDto } from "@/db/models/workflows/WorkflowBlocksModel";

export type WorkflowExecutionModel = {
  id: string;
  workflowId: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  startedAt: Date;
  completedAt: Date | null;
};

export type WorkflowExecutionWithDetailsDto = WorkflowExecution & {
  workflow: { id: string; name: string };
  tenant: { id: string; name: string; slug: string } | null;
  waitingBlock: WorkflowBlockWithDetailsDto | null;
  blockRuns: (WorkflowBlockExecution & {
    workflowBlock: {
      type: string;
      description: string;
    };
  })[];
};
