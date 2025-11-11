import {
  PromptFlow,
  PromptFlowInputVariable,
  PromptTemplate,
  PromptFlowOutput,
  PromptFlowOutputMapping,
  PromptFlowGroup,
  PromptFlowExecution,
  Tenant,
  PromptTemplateResult,
} from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type PromptFlowsModel = {
  id: string;
  name: string;
  description: string;
};

export type PromptFlowWithDetailsDto = PromptFlow & {
  inputVariables: PromptFlowInputVariable[];
  inputEntity: { id: string; name: string; title: string } | null;
  templates: PromptTemplate[];
  outputs: (PromptFlowOutput & {
    entity: { id: string; name: string; title: string };
    mappings: (PromptFlowOutputMapping & {
      promptTemplate: PromptTemplate;
      property: { id: string; name: string; title: string };
    })[];
  })[];
};

export type PromptFlowWithExecutionsDto = PromptFlowWithDetailsDto & {
  promptFlowGroup: PromptFlowGroup | null;
  executions: (PromptFlowExecution & {
    user: UserDto | null;
    tenant: Tenant | null;
    results: PromptTemplateResult[];
  })[];
};

export type CreatePromptFlowDto = {
  model: string;
  stream: boolean;
  title: string;
  description: string;
  actionTitle: string | null;
  executionType: string; // sequential, parallel
  promptFlowGroupId: string | null;
  inputEntityId: string | null;
  isPublic: boolean;
  templates: {
    order: number;
    title: string;
    template: string;
    temperature: number;
    maxTokens: number | null;
  }[];
  inputVariables?: {
    type: string;
    name: string;
    title: string;
    isRequired: boolean;
  }[];
  outputs?: {
    type: string;
    entityId: string;
    mappings: {
      promptTemplateId: string;
      propertyId: string;
    }[];
  }[];
};
