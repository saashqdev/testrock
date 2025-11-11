import { IWorkflowsDb } from "@/db/interfaces/workflows/IWorkflowsDb";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import TenantModelHelper from "@/lib/helpers/models/TenantModelHelper";
import { WorkflowWithDetailsDto } from "@/db/models/workflows/WorkflowsModel";

export class WorkflowsDbPrisma implements IWorkflowsDb {
  async getAllWorkflows({ tenantId, status }: { tenantId: string | null; status?: "draft" | "live" | "archived" }): Promise<WorkflowWithDetailsDto[]> {
    return await prisma.workflow.findMany({
      where: { tenantId, status },
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        blocks: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
          },
        },
        inputExamples: true,
        _count: { select: { executions: true } },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });
  }

  async getAllWorkflowsAppliesToAllTenants({
    tenantId,
    status,
  }: {
    tenantId: string | null;
    status?: "draft" | "live" | "archived";
  }): Promise<WorkflowWithDetailsDto[]> {
    const where: Prisma.WorkflowWhereInput = { status };
    if (tenantId === null) {
      where.tenantId = null;
    } else {
      where.OR = [{ tenantId }, { appliesToAllTenants: true, tenantId: null }];
    }
    return await prisma.workflow.findMany({
      where,
      include: {
        tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
        blocks: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
          },
        },
        inputExamples: true,
        _count: { select: { executions: true } },
      },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });
  }

  async getWorkflowsIdsAndNames({ tenantId }: { tenantId: string | null }): Promise<{ id: string; name: string }[]> {
    return await prisma.workflow.findMany({
      where: { tenantId },
      select: { id: true, name: true },
      orderBy: [{ createdAt: "desc" }, { name: "asc" }],
    });
  }

  async getWorkflowById({ id, tenantId }: { id: string; tenantId: string | null }): Promise<WorkflowWithDetailsDto | null> {
    return await prisma.workflow
      .findFirstOrThrow({
        where: { id, tenantId },
        include: {
          tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
          blocks: {
            include: {
              toBlocks: { include: { toBlock: true } },
              conditionsGroups: {
                include: { conditions: { orderBy: { index: "asc" } } },
                orderBy: { index: "asc" },
              },
            },
          },
          inputExamples: true,
          _count: { select: { executions: true } },
        },
      })
      .catch(() => {
        return null;
      });
  }

  async getWorkflow(id: string): Promise<WorkflowWithDetailsDto | null> {
    return await prisma.workflow
      .findUnique({
        where: { id },
        include: {
          tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
          blocks: {
            include: {
              toBlocks: { include: { toBlock: true } },
              conditionsGroups: {
                include: { conditions: { orderBy: { index: "asc" } } },
                orderBy: { index: "asc" },
              },
            },
          },
          inputExamples: true,
          _count: { select: { executions: true } },
        },
      })
      .catch(() => {
        return null;
      });
  }

  async getWorkflowByName({ name, tenantId }: { name: string; tenantId: string | null }): Promise<WorkflowWithDetailsDto | null> {
    return await prisma.workflow
      .findFirstOrThrow({
        where: { name, tenantId },
        include: {
          tenant: { select: TenantModelHelper.selectSimpleTenantProperties },
          blocks: {
            include: {
              toBlocks: { include: { toBlock: true } },
              conditionsGroups: {
                include: { conditions: { orderBy: { index: "asc" } } },
                orderBy: { index: "asc" },
              },
            },
          },
          inputExamples: true,
          _count: { select: { executions: true } },
        },
      })
      .catch(() => {
        return null;
      });
  }

  async createWorkflow(data: { tenantId: string | null; createdByUserId: string | null; name: string; description: string }) {
    return await prisma.workflow.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        description: data.description,
        createdByUserId: data.createdByUserId,
      },
    });
  }

  async updateWorkflow(
    id: string,
    data: {
      name?: string;
      description?: string;
      status?: "draft" | "live" | "archived";
      appliesToAllTenants?: boolean;
    }
  ) {
    return await prisma.workflow.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        status: data.status,
        appliesToAllTenants: data.appliesToAllTenants,
      },
    });
  }

  async deleteWorkflow(id: string) {
    return await prisma.workflow.deleteMany({
      where: { id },
    });
  }

  async countWorkflows({ tenantId }: { tenantId: string | null }) {
    return await prisma.workflow.count({
      where: { tenantId },
    });
  }
}
