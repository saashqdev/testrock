import { IFormulaLogsDb } from "@/db/interfaces/entityBuilder/IFormulaLogsDb";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import { FiltersDto } from "@/lib/dtos/data/FiltersDto";
import { FormulaLogWithDetailsDto } from "@/db/models/entityBuilder/FormulaLogsModel";

export class FormulaLogsDbPrisma implements IFormulaLogsDb {
  async getFormulaLogs({
    id,
    pagination,
    filters,
  }: {
    id: string | undefined;
    pagination: { pageSize: number; page: number };
    filters: FiltersDto;
  }): Promise<{ items: FormulaLogWithDetailsDto[]; total: number }> {
    let where: Prisma.FormulaLogWhereInput = {
      formulaId: id,
    };
    const statusFilter = filters.properties.find((filter) => filter.name === "status")?.value;
    if (statusFilter) {
      if (statusFilter === "success") {
        where = { ...where, error: null, result: { not: "" } };
      } else if (statusFilter === "error") {
        where = { ...where, error: { not: null } };
      } else if (statusFilter === "empty") {
        where = { ...where, result: "", error: null };
      }
    }
    const hasRowIdFilter = filters.properties.find((filter) => filter.name === "hasRowId")?.value;
    if (hasRowIdFilter) {
      where = { ...where, components: { some: { rowId: hasRowIdFilter } } };
    }
    filters.properties
      .filter((f) => !f.manual && f.value)
      .forEach((filter) => {
        where = { ...where, [filter.name]: filter.value };
      });
    const items = await prisma.formulaLog.findMany({
      take: pagination.pageSize,
      skip: pagination.pageSize * (pagination.page - 1),
      where,
      include: {
        formula: { select: { id: true, name: true } },
        user: { select: { id: true, email: true } },
        tenant: { select: { id: true, name: true } },
        components: true,
      },
      orderBy: { createdAt: "desc" },
    });
    const total = await prisma.formulaLog.count({ where });
    return {
      items,
      total,
    };
  }

  async countLogs(ids: string[]): Promise<{ formulaId: string; count: number }[]> {
    return (
      await prisma.formulaLog.groupBy({
        by: ["formulaId"],
        where: { formulaId: { in: ids } },
        _count: { formulaId: true },
      })
    ).map((item) => ({ formulaId: item.formulaId, count: item._count.formulaId }));
  }

  async createFormulaLog(data: {
    formulaId: string;
    userId: string | null;
    tenantId: string | null;
    originalTrigger: string;
    triggeredBy: string;
    expression: string;
    result: string;
    error: string | null;
    rowValueId: string | null;
    components: {
      order: number;
      type: string;
      value: string;
      rowId: string | null;
    }[];
  }) {
    return await prisma.formulaLog.create({
      data: {
        formulaId: data.formulaId,
        userId: data.userId,
        tenantId: data.tenantId,
        originalTrigger: data.originalTrigger,
        triggeredBy: data.triggeredBy,
        expression: data.expression,
        duration: 0,
        result: data.result,
        error: data.error,
        rowValueId: data.rowValueId,
        components: {
          create: data.components.map((component) => ({
            order: component.order,
            type: component.type,
            value: component.value,
            rowId: component.rowId,
          })),
        },
      },
    });
  }

  async updateFormulaLog(
    id: string,
    data: {
      duration: number;
      result: string;
      error: string | null;
    }
  ) {
    return await prisma.formulaLog.update({
      where: { id },
      data: {
        result: data.result,
        error: data.error,
      },
    });
  }
}
