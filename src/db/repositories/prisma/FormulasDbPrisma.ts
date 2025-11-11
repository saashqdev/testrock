import { IFormulasDb } from "@/db/interfaces/entityBuilder/IFormulasDb";
import { Prisma, Formula } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { FormulaWithDetailsDto, CreateFormulaDto } from "@/db/models/entityBuilder/FormulasModel";

export class FormulasDbPrisma implements IFormulasDb {
  async getAllFormulas(): Promise<FormulaWithDetailsDto[]> {
    return await prisma.formula.findMany({
      include: {
        components: { orderBy: { order: "asc" } },
        inProperties: { include: { entity: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllFormulasIdsAndNames(): Promise<{ id: string; name: string }[]> {
    return await prisma.formula.findMany({
      select: { id: true, name: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getAllFormulasInIds(ids: string[]): Promise<FormulaWithDetailsDto[]> {
    return await prisma.formula.findMany({
      where: { id: { in: ids } },
      include: {
        components: { orderBy: { order: "asc" } },
        inProperties: { include: { entity: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getFormula(id: string): Promise<FormulaWithDetailsDto | null> {
    return await prisma.formula.findUnique({
      where: { id },
      include: {
        components: { orderBy: { order: "asc" } },
        inProperties: { include: { entity: true } },
      },
    });
  }

  async getFormulaWithLogs(id: string): Promise<FormulaWithDetailsDto | null> {
    return await prisma.formula.findUnique({
      where: { id },
      include: {
        components: { orderBy: { order: "asc" } },
        inProperties: { include: { entity: true } },
      },
    });
  }

  async createFormula(data: CreateFormulaDto): Promise<Formula> {
    return await prisma.formula.create({
      data: {
        name: data.name,
        description: data.description,
        resultAs: data.resultAs,
        calculationTrigger: data.calculationTrigger,
        withLogs: data.withLogs,
        components: {
          create: data.components.map((component) => ({
            order: component.order,
            type: component.type,
            value: component.value,
          })),
        },
      },
    });
  }

  async updateFormula(
    id: string,
    data: {
      name?: string;
      description?: string | null;
      resultAs?: string;
      calculationTrigger?: string;
      withLogs?: boolean;
      components?: {
        order: number;
        type: string;
        value: string;
      }[];
    }
  ): Promise<Formula> {
    const update: Prisma.FormulaUpdateInput = {
      name: data.name,
      description: data.description,
      resultAs: data.resultAs,
      calculationTrigger: data.calculationTrigger,
      withLogs: data.withLogs,
    };
    if (data.components) {
      update.components = {
        deleteMany: {},
        create: data.components,
      };
    }
    return await prisma.formula.update({
      where: { id },
      data: update,
    });
  }

  async deleteFormula(id: string): Promise<Formula> {
    return await prisma.formula.delete({ where: { id } });
  }
}
