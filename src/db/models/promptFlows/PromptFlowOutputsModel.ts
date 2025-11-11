import { PromptFlowOutput, PromptFlowOutputMapping, PromptTemplate } from "@prisma/client";

export type PromptFlowOutputsModel = {
  id: string;
  promptFlowId: string;
  nodeId: string;
  output: string;
};

export type PromptFlowOutputWithDetailsDto = PromptFlowOutput & {
  entity: { id: string; name: string; title: string };
  mappings: (PromptFlowOutputMapping & {
    promptTemplate: PromptTemplate;
    property: { id: string; name: string; title: string; type: number };
  })[];
};
