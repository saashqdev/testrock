import { PromptFlowInputVariable } from "@prisma/client";

export type PromptFlowInputVariableModel = {
  id: string;
  promptFlowId: string;
  name: string;
  type: string;
  defaultValue?: string;
};

export type PromptFlowInputVariableWithDetailsDto = PromptFlowInputVariable & {};
