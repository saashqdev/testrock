import { PromptFlow, PromptTemplateResult, PromptFlowExecution, PromptTemplate, Tenant } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type PromptFlowExecutionsModel = {
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
}

export type PromptTemplateResultsModel = {
    id: string;
    createdAt: Date;
    updatedAt: Date;
    flowExecutionId: string;
    templateId: string | null;
    order: number;
    status: string;
    prompt: string;
    response: string | null;
    error: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
}

export type PromptTemplateResultWithTemplateDto = PromptTemplateResult & {
  template: PromptTemplate | null;
};

export type PromptFlowExecutionWithResultsDto = PromptFlowExecution & {
  user: UserDto | null;
  tenant: Tenant | null;
  flow: PromptFlow;
  results: PromptTemplateResultWithTemplateDto[];
};
