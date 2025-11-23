export interface IPromptFlowInputVariablesDb {
  getPromptFlowVariables(promptFlowId: string): Promise<
    {
      name: string;
      id: string;
      promptFlowId: string;
      type: string;
      title: string;
      isRequired: boolean;
    }[]
  >;
  getPromptFlowVariable(id: string): Promise<{
    name: string;
    id: string;
    promptFlowId: string;
    type: string;
    title: string;
    isRequired: boolean;
  } | null>;
  createPromptFlowVariable(data: { promptFlowId: string; type: string; name: string; title: string; isRequired: boolean }): Promise<{
    name: string;
    id: string;
    promptFlowId: string;
    type: string;
    title: string;
    isRequired: boolean;
  }>;
  updatePromptFlowVariable(
    id: string,
    data: {
      type: string;
      name: string;
      title: string;
      isRequired: boolean;
    }
  ): Promise<{
    name: string;
    id: string;
    promptFlowId: string;
    type: string;
    title: string;
    isRequired: boolean;
  }>;
  deletePromptFlowVariable(id: string): Promise<{
    name: string;
    id: string;
    promptFlowId: string;
    type: string;
    title: string;
    isRequired: boolean;
  }>;
}
