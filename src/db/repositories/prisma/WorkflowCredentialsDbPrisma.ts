import { IWorkflowCredentialsDb } from "@/db/interfaces/workflows/IWorkflowCredentialsDb";
import { prisma } from "@/db/config/prisma/database";

export class WorkflowCredentialsDbPrisma implements IWorkflowCredentialsDb {
  async getAllWorkflowCredentials({ tenantId }: { tenantId: string | null }) {
    return await prisma.workflowCredential.findMany({
      where: { tenantId },
      orderBy: { createdAt: "desc" },
    });
  }

  async getWorkflowCredentialById(id: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.workflowCredential
      .findFirstOrThrow({
        where: { id, tenantId },
      })
      .catch(() => {
        return null;
      });
  }

  async getWorkflowCredentialByName(name: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.workflowCredential
      .findFirstOrThrow({
        where: { name, tenantId },
      })
      .catch(() => {
        return null;
      });
  }

  async createWorkflowCredential({
    tenantId,
    createdByUserId,
    name,
    value,
  }: {
    tenantId: string | null;
    createdByUserId: string | null;
    name: string;
    value: string;
  }) {
    return await prisma.workflowCredential.create({
      data: {
        tenantId,
        createdByUserId,
        name,
        value,
      },
    });
  }

  async updateWorkflowCredential(id: string, { value }: { value?: string }) {
    return await prisma.workflowCredential.update({
      where: {
        id,
      },
      data: {
        value,
      },
    });
  }

  async deleteWorkflowCredential(id: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.workflowCredential.deleteMany({
      where: {
        id,
        tenantId,
      },
    });
  }
}
