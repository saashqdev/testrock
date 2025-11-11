import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";

export interface IPromptFlowOutputsDb {
  getPromptFlowOutputs(promptFlowId: string): Promise<PromptFlowOutputWithDetailsDto[]>;
  getPromptFlowOutput(id: string): Promise<PromptFlowOutputWithDetailsDto | null>;
  createPromptFlowOutput(data: { promptFlowId: string; type: string; entityId: string }): Promise<{
    id: string;
    promptFlowId: string;
    type: string;
    entityId: string;
  }>;
  updatePromptFlowOutput(
    id: string,
    data: {
      type: string;
      entityId: string;
    }
  ): Promise<{
    id: string;
    promptFlowId: string;
    type: string;
    entityId: string;
  }>;
  deletePromptFlowOutput(id: string): Promise<{
    id: string;
    promptFlowId: string;
    type: string;
    entityId: string;
  }>;
}
