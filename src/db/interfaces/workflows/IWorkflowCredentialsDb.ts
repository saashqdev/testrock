import { Prisma } from "@prisma/client";

export interface IWorkflowCredentialsDb {
  getAllWorkflowCredentials({ tenantId }: { tenantId: string | null }): Promise<
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
  getWorkflowCredentialById(
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
  getWorkflowCredentialByName(
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
  createWorkflowCredential({
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
  updateWorkflowCredential(
    id: string,
    {
      value,
    }: {
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
  deleteWorkflowCredential(
    id: string,
    {
      tenantId,
    }: {
      tenantId: string | null;
    }
  ): Promise<Prisma.BatchPayload>;
}
