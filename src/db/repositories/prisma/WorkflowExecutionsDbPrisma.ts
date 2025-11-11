import { IWorkflowExecutionsDb } from "@/db/interfaces/workflows/IWorkflowExecutionsDb";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { WorkflowExecutionWithDetailsDto } from "@/db/models/workflows/WorkflowExecutionsModel";
import { WorkflowStatus } from "@/modules/workflowEngine/dtos/WorkflowStatus";

export class WorkflowExecutionsDbPrisma implements IWorkflowExecutionsDb {
  async getAllWorkflowExecutions({
    tenantId,
    pagination,
    filters,
  }: {
    tenantId: string | null;
    pagination: { page: number; pageSize: number };
    filters: FiltersDto;
  }): Promise<{ items: WorkflowExecutionWithDetailsDto[]; pagination: PaginationDto }> {
    let where: Prisma.WorkflowExecutionWhereInput = {};
    if (tenantId === null) {
      where = {
        OR: [{ appliesToAllTenants: true }, { tenantId: null }],
      };
    } else {
      where = {
        tenantId,
        appliesToAllTenants: false,
      };
    }
    const workflowId = filters?.properties.find((f) => f.name === "workflowId")?.value ?? filters?.query ?? "";
    const status = filters?.properties.find((f) => f.name === "status")?.value ?? filters?.query ?? "";
    const type = filters?.properties.find((f) => f.name === "workflowId")?.value ?? filters?.query ?? "";
    if (workflowId) {
      where.workflowId = workflowId;
    }
    if (status) {
      where.status = status;
    }
    if (type) {
      where.type = type;
    }
    const items = await prisma.workflowExecution.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where,
      include: {
        workflow: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true, slug: true } },
        waitingBlock: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
          },
        },
        blockRuns: {
          orderBy: { startedAt: "asc" },
          include: {
            workflowBlock: {
              select: { type: true, description: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    const totalItems = await prisma.workflowExecution.count({
      where,
    });
    return {
      items,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        totalItems,
        totalPages: Math.ceil(totalItems / pagination.pageSize),
      },
    };
  }

  async getWorkflowExecutions({ workflowId }: { workflowId: string }, session: { tenantId: string | null }): Promise<WorkflowExecutionWithDetailsDto[]> {
    const where: Prisma.WorkflowExecutionWhereInput = {
      workflowId,
    };
    if (session.tenantId !== null) {
      where.tenantId = session.tenantId;
    }
    return prisma.workflowExecution.findMany({
      where,
      include: {
        workflow: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true, slug: true } },
        waitingBlock: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
          },
        },
        blockRuns: {
          orderBy: { startedAt: "asc" },
          include: {
            workflowBlock: {
              select: { type: true, description: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getWorkflowExecution(id: string, session: { tenantId: string | null }): Promise<WorkflowExecutionWithDetailsDto | null> {
    return prisma.workflowExecution
      .findFirstOrThrow({
        where: {
          id,
          tenantId: session.tenantId,
        },
        include: {
          workflow: { select: { id: true, name: true } },
          tenant: { select: { id: true, name: true, slug: true } },
          waitingBlock: {
            include: {
              toBlocks: { include: { toBlock: true } },
              conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
            },
          },
          blockRuns: {
            orderBy: { startedAt: "asc" },
            include: {
              workflowBlock: {
                select: { type: true, description: true },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      })
      .catch(() => null);
  }

  async countWorkflowExecutions({ tenantId }: { tenantId: string | null }): Promise<number> {
    let where: Prisma.WorkflowExecutionWhereInput = {};
    if (tenantId === null) {
      where = {
        OR: [{ appliesToAllTenants: true }, { tenantId: null }],
      };
    } else {
      where = {
        tenantId,
        appliesToAllTenants: false,
      };
    }
    return await prisma.workflowExecution.count({
      where,
    });
  }

  async updateWorkflowExecution(
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
  ): Promise<WorkflowExecutionWithDetailsDto> {
    return await prisma.workflowExecution.update({
      where: { id },
      data: {
        status: error ? "error" : status,
        output,
        duration: Math.round(duration),
        endedAt: new Date(),
        error,
        waitingBlockId,
      },
      include: {
        workflow: { select: { id: true, name: true } },
        tenant: { select: { id: true, name: true, slug: true } },
        waitingBlock: {
          include: {
            toBlocks: { include: { toBlock: true } },
            conditionsGroups: { include: { conditions: { orderBy: { index: "asc" } } }, orderBy: { index: "asc" } },
          },
        },
        blockRuns: {
          orderBy: { startedAt: "asc" },
          include: {
            workflowBlock: {
              select: { type: true, description: true },
            },
          },
        },
      },
    });
  }

  async deleteWorkflowExecution(id: string) {
    return await prisma.workflowExecution.delete({
      where: {
        id,
      },
    });
  }
}
