import { IPromptExecutionsDb } from "@/db/interfaces/promptFlows/IPromptExecutionsDb";
import { prisma } from "@/db/config/prisma/database";
import { PromptFlowExecutionWithResultsDto } from "@/db/models/promptFlows/PromptFlowExecutionsModel";
import { PromptFlowExecution, PromptTemplateResult } from "@prisma/client";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";

export class PromptExecutionsDbPrisma implements IPromptExecutionsDb {
  async getPromptFlowExecutions(): Promise<PromptFlowExecutionWithResultsDto[]> {
    return await prisma.promptFlowExecution.findMany({
      include: {
        flow: true,
        user: { select: UserModelHelper.selectSimpleUserProperties },
        tenant: true,
        results: { include: { template: true }, orderBy: { order: "asc" } },
      },
    });
  }

  async getPromptFlowExecution(id: string): Promise<PromptFlowExecutionWithResultsDto | null> {
    return await prisma.promptFlowExecution.findUnique({
      where: { id },
      include: {
        flow: true,
        user: { select: UserModelHelper.selectSimpleUserProperties },
        tenant: true,
        results: { include: { template: true }, orderBy: { order: "desc" } },
      },
    });
  }

  async createPromptFlowExecution(data: {
    flowId: string;
    userId: string | null;
    tenantId: string | null;
    status: string;
    model: string;
    results: {
      order: number;
      templateId: string;
      status: string;
      prompt: string;
    }[];
  }): Promise<PromptFlowExecution> {
    return await prisma.promptFlowExecution.create({
      data: {
        flowId: data.flowId,
        userId: data.userId,
        tenantId: data.tenantId,
        status: data.status,
        model: data.model,
        results: { create: data.results },
      },
    });
  }

  async updatePromptFlowExecution(
    id: string,
    data: {
      status?: string;
      error?: string | null;
      startedAt?: Date;
      completedAt?: Date;
      duration?: number | null;
    }
  ): Promise<PromptFlowExecution> {
    return await prisma.promptFlowExecution.update({
      where: { id },
      data: {
        status: data.status,
        error: data.error,
        startedAt: data.startedAt,
        completedAt: data.completedAt,
        duration: data.duration,
      },
    });
  }

  async updatePromptTemplateResult(
    id: string,
    data: {
      status?: string;
      prompt?: string;
      response?: string;
      error?: string | null;
      startedAt?: Date;
      completedAt?: Date;
    }
  ): Promise<PromptTemplateResult> {
    return await prisma.promptTemplateResult.update({
      where: { id },
      data,
    });
  }

  async deletePromptFlowExecution(id: string) {
    return await prisma.promptFlowExecution.delete({ where: { id } });
  }
}
