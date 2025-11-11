import { IWorkflowVariableDb } from "@/db/interfaces/workflows/IWorkflowVariableDb";
import { prisma } from "@/db/config/prisma/database";

export class WorkflowVariableDbPrisma implements IWorkflowVariableDb {
  async getAllWorkflowVariables({ tenantId }: { tenantId: string | null }) {
    return await prisma.workflowVariable.findMany({
      where: { tenantId },
      orderBy: { updatedAt: "desc" },
    });
  }

  async getWorkflowVariableById(id: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.workflowVariable
      .findFirstOrThrow({
        where: { id, tenantId },
      })
      .catch(() => {
        return null;
      });
  }

  async getWorkflowVariableByName(name: string, { tenantId }: { tenantId: string | null }) {
    return await prisma.workflowVariable
      .findFirstOrThrow({
        where: { name, tenantId },
      })
      .catch(() => {
        return null;
      });
  }

  async createWorkflowVariable({
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
    return await prisma.workflowVariable.create({
      data: {
        tenantId,
        createdByUserId,
        name,
        value,
      },
    });
  }

  async updateWorkflowVariable(id: string, { name, value }: { name?: string; value?: string }) {
    return await prisma.workflowVariable.update({
      where: {
        id,
      },
      data: {
        name,
        value,
      },
    });
  }

  async deleteWorkflowVariable(id: string) {
    return await prisma.workflowVariable.delete({
      where: {
        id,
      },
    });
  }
}
