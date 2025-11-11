import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { WorkflowBlockDto } from "./WorkflowBlockDto";
import { WorkflowInputExampleDto } from "./WorkflowInputExampleDto";

export type WorkflowDto = {
  id: string;
  tenantId: string | null;
  tenant: TenantDto | null;
  name: string;
  description: string;
  status: "draft" | "live" | "archived";
  createdAt: Date;
  updatedAt: Date | null;
  appliesToAllTenants: boolean;
  blocks: WorkflowBlockDto[];
  inputExamples: WorkflowInputExampleDto[];
  _count: {
    executions: number;
  };
  $variables?: string[];
  $credentials?: string[];
};
