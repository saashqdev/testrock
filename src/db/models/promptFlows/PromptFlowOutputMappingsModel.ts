import { PromptFlowOutputMapping, PromptTemplate } from "@prisma/client";

export type PromptFlowOutputMappingsModel = {
    id: string;
    promptFlowOutputId: string;
    promptTemplateId: string;
    propertyId: string;
};

export type PromptFlowOutputMappingWithDetailsDto = PromptFlowOutputMapping & {
  promptTemplate: PromptTemplate;
  property: { id: string; name: string; title: string };
};
