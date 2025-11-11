import { PromptFlowExecutionWithResultsDto } from "@/db/models/promptFlows/PromptFlowExecutionsModel";

export interface IPromptExecutionsDb {
  getPromptFlowExecutions(): Promise<PromptFlowExecutionWithResultsDto[]>;
  getPromptFlowExecution(id: string): Promise<PromptFlowExecutionWithResultsDto | null>;
  createPromptFlowExecution(data: {
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
  }): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    flowId: string;
    model: string | null;
    userId: string | null;
    tenantId: string | null;
    status: string;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    duration: number | null;
  }>;
  updatePromptFlowExecution(
    id: string,
    data: {
      status?: string | undefined;
      error?: string | null | undefined;
      startedAt?: Date | undefined;
      completedAt?: Date | undefined;
      duration?: number | null | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    flowId: string;
    model: string | null;
    userId: string | null;
    tenantId: string | null;
    status: string;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    duration: number | null;
  }>;
  updatePromptTemplateResult(
    id: string,
    data: {
      status?: string | undefined;
      prompt?: string | undefined;
      response?: string | undefined;
      error?: string | null | undefined;
      startedAt?: Date | undefined;
      completedAt?: Date | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    status: string;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    order: number;
    flowExecutionId: string;
    templateId: string | null;
    prompt: string;
    response: string | null;
  }>;
  deletePromptFlowExecution(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    flowId: string;
    model: string | null;
    userId: string | null;
    tenantId: string | null;
    status: string;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
    duration: number | null;
  }>;
}
