import { PromptFlowOutputMappingWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputMappingsModel";

export interface IPromptFlowOutputMappingsDb {
  getPromptFlowOutputMapping(id: string): Promise<PromptFlowOutputMappingWithDetailsDto | null>;
  createPromptFlowOutputMapping(data: { promptFlowOutputId: string; promptTemplateId: string; propertyId: string }): Promise<{
    id: string;
    promptFlowOutputId: string;
    promptTemplateId: string;
    propertyId: string;
  }>;
  updatePromptFlowOutputMapping(
    id: string,
    data: {
      promptTemplateId: string;
      propertyId: string;
    }
  ): Promise<{
    id: string;
    promptFlowOutputId: string;
    promptTemplateId: string;
    propertyId: string;
  }>;
  deletePromptFlowOutputMapping(id: string): Promise<{
    id: string;
    promptFlowOutputId: string;
    promptTemplateId: string;
    propertyId: string;
  }>;
}
