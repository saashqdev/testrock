import { WorkflowWithDetailsDto } from "@/db/models/workflows/WorkflowsModel";
import { Prisma } from "@prisma/client";

export interface IWorkflowsDb {
  getAllWorkflows({ tenantId, status }: { tenantId: string | null; status?: "draft" | "live" | "archived" | undefined }): Promise<WorkflowWithDetailsDto[]>;
  getAllWorkflowsAppliesToAllTenants({
    tenantId,
    status,
  }: {
    tenantId: string | null;
    status?: "draft" | "live" | "archived" | undefined;
  }): Promise<WorkflowWithDetailsDto[]>;
  getWorkflowsIdsAndNames({ tenantId }: { tenantId: string | null }): Promise<
    {
      id: string;
      name: string;
    }[]
  >;
  getWorkflowById({ id, tenantId }: { id: string; tenantId: string | null }): Promise<WorkflowWithDetailsDto | null>;
  getWorkflow(id: string): Promise<WorkflowWithDetailsDto | null>;
  getWorkflowByName({ name, tenantId }: { name: string; tenantId: string | null }): Promise<WorkflowWithDetailsDto | null>;
  createWorkflow(data: { tenantId: string | null; createdByUserId: string | null; name: string; description: string }): Promise<{
    tenantId: string | null;
    status: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    createdByUserId: string | null;
    appliesToAllTenants: boolean;
  }>;
  updateWorkflow(
    id: string,
    data: {
      name?: string | undefined;
      description?: string | undefined;
      status?: "draft" | "live" | "archived" | undefined;
      appliesToAllTenants?: boolean | undefined;
    }
  ): Promise<{
    tenantId: string | null;
    status: string;
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
    description: string;
    createdByUserId: string | null;
    appliesToAllTenants: boolean;
  }>;
  deleteWorkflow(id: string): Promise<Prisma.BatchPayload>;
  countWorkflows({ tenantId }: { tenantId: string | null }): Promise<number>;
}
