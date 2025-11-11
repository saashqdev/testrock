export interface IWorkflowVariableDb {
  getAllWorkflowVariables({ tenantId }: { tenantId: string | null }): Promise<
    {
      tenantId: string | null;
      id: string;
      createdAt: Date;
      updatedAt: Date;
      name: string;
      value: string;
      createdByUserId: string | null;
      userId: string | null;
    }[]
  >;
  getWorkflowVariableById(
    id: string,
    {
      tenantId,
    }: {
      tenantId: string | null;
    }
  ): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    value: string;
    createdByUserId: string | null;
    userId: string | null;
  } | null>;
  getWorkflowVariableByName(
    name: string,
    {
      tenantId,
    }: {
      tenantId: string | null;
    }
  ): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    value: string;
    createdByUserId: string | null;
    userId: string | null;
  } | null>;
  createWorkflowVariable({
    tenantId,
    createdByUserId,
    name,
    value,
  }: {
    tenantId: string | null;
    createdByUserId: string | null;
    name: string;
    value: string;
  }): Promise<{
    tenantId: string | null;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    name: string;
    value: string;
    createdByUserId: string | null;
    userId: string | null;
  }>;
  updateWorkflowVariable(
    id: string,
    {
      name,
      value,
    }: {
      name?: string | undefined;
      value?: string | undefined;
    }
  ): Promise<{
    tenantId: string | null;
    createdByUserId: string | null;
    name: string;
    value: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
  }>;
  deleteWorkflowVariable(id: string): Promise<{
    tenantId: string | null;
    createdByUserId: string | null;
    name: string;
    value: string;
    id: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string | null;
  }>;
}
