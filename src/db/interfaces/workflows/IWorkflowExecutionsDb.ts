import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { WorkflowExecutionWithDetailsDto } from "@/db/models/workflows/WorkflowExecutionsModel";
import { WorkflowStatus } from "@/modules/workflowEngine/dtos/WorkflowStatus";

export interface IWorkflowExecutionsDb {
  getAllWorkflowExecutions({
    tenantId,
    pagination,
    filters,
  }: {
    tenantId: string | null;
    pagination: {
      page: number;
      pageSize: number;
    };
    filters: FiltersDto;
  }): Promise<{
    items: WorkflowExecutionWithDetailsDto[];
    pagination: PaginationDto;
  }>;
  getWorkflowExecutions(
    {
      workflowId,
    }: {
      workflowId: string;
    },
    session: {
      tenantId: string | null;
    }
  ): Promise<WorkflowExecutionWithDetailsDto[]>;
  getWorkflowExecution(
    id: string,
    session: {
      tenantId: string | null;
    }
  ): Promise<WorkflowExecutionWithDetailsDto | null>;
  countWorkflowExecutions({ tenantId }: { tenantId: string | null }): Promise<number>;
  updateWorkflowExecution(
    id: string,
    {
      error,
      status,
      output,
      duration,
      waitingBlockId,
    }: {
      error: string | null;
      status: WorkflowStatus;
      output: string;
      duration: number;
      waitingBlockId: string | null;
    }
  ): Promise<WorkflowExecutionWithDetailsDto>;
  deleteWorkflowExecution(id: string): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    workflowId: string;
    type: string;
    status: string;
    input: string;
    output: string | null;
    duration: number | null;
    endedAt: Date | null;
    error: string | null;
    waitingBlockId: string | null;
    createdByUserId: string | null;
    appliesToAllTenants: boolean;
  }>;
}
