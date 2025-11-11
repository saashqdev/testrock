import { Workflow, WorkflowInputExample } from "@prisma/client";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { WorkflowBlockWithDetailsDto } from "@/db/models/workflows/WorkflowBlocksModel";

export type WorkflowsModel = {
  id: string;
  name: string;
  description: string | null;
  version: number;
};

export type WorkflowWithDetailsDto = Workflow & {
  tenant: TenantDto | null;
  blocks: WorkflowBlockWithDetailsDto[];
  inputExamples: WorkflowInputExample[];
  _count: {
    executions: number;
  };
};
