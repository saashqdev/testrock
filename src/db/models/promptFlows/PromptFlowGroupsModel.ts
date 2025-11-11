import { PromptFlow, PromptFlowGroup, PromptFlowGroupTemplate } from "@prisma/client";

export type PromptFlowGroupModel = {
  id: number;
  promptFlowId: number;
  name: string;
  description: string | null;
  order: number;
};

export type PromptFlowGroupWithDetailsDto = PromptFlowGroup & {
  templates: PromptFlowGroupTemplate[];
  promptFlows: PromptFlow[];
};
