import { PromptFlowGroupWithDetailsDto } from "@/db/models/promptFlows/PromptFlowGroupsModel";

export interface IPromptFlowGroupsDb {
  getAllPromptFlowGroups(): Promise<PromptFlowGroupWithDetailsDto[]>;
  getPromptFlowGroup(id: string): Promise<PromptFlowGroupWithDetailsDto | null>;
  getPromptFlowGroupByTitle(title: string): Promise<PromptFlowGroupWithDetailsDto | null>;
  createPromptFlowGroup(data: {
    order: number;
    title: string;
    description: string;
    templates: {
      order: number;
      title: string;
    }[];
  }): Promise<PromptFlowGroupWithDetailsDto>;
  updatePromptFlowGroup(
    id: string,
    data: {
      order?: number | undefined;
      title?: string | undefined;
      description?: string | undefined;
      templates?:
        | {
            id?: string | undefined;
            order: number;
            title: string;
          }[]
        | undefined;
    }
  ): Promise<PromptFlowGroupWithDetailsDto>;
  deletePromptFlowGroup(id: string): Promise<PromptFlowGroupWithDetailsDto>;
}
