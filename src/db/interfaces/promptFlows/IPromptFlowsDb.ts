import { PromptFlowWithDetailsDto, PromptFlowWithExecutionsDto, CreatePromptFlowDto } from "@/db/models/promptFlows/PromptFlowsModel";

export interface IPromptFlowsDb {
  getPromptFlows(params?: { isPublic?: boolean }): Promise<PromptFlowWithDetailsDto[]>;
  getPromptFlowsWithExecutions({ isPublic }?: { isPublic?: boolean | undefined }): Promise<PromptFlowWithExecutionsDto[]>;
  getPromptFlow(id: string): Promise<PromptFlowWithDetailsDto | null>;
  getPromptFlowsByEntity(entityId: string): Promise<PromptFlowWithDetailsDto[]>;
  getPromptFlowsByEntityName(entityName: string): Promise<PromptFlowWithDetailsDto[]>;
  getPromptFlowByName(title: string): Promise<PromptFlowWithDetailsDto | null>;
  getPromptFlowWithExecutions(id: string): Promise<PromptFlowWithExecutionsDto | null>;
  createPromptFlow(data: CreatePromptFlowDto): Promise<PromptFlowWithDetailsDto>;
  updatePromptFlow(
    id: string,
    data: {
      model?: string;
      stream?: boolean;
      title?: string;
      description?: string;
      actionTitle?: string | null;
      executionType?: string; // sequential, parallel
      promptFlowGroupId?: string | null;
      inputEntityId?: string | null;
      isPublic?: boolean;
      templates?: {
        id?: string;
        order: number;
        title: string;
        template: string;
        temperature: number;
        maxTokens: number | null;
      }[];
      outputs?: {
        type: string;
        entityId: string;
        mappings: {
          promptTemplateId: string;
          propertyId: string;
        }[];
      }[];
    }
  ): Promise<PromptFlowWithDetailsDto>;
  deletePromptFlow(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    model: string;
    title: string;
    description: string;
    actionTitle: string | null;
    executionType: string;
    promptFlowGroupId: string | null;
    stream: boolean;
    public: boolean;
    inputEntityId: string | null;
  }>;
}
