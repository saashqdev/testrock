export interface IWorkflowBlocksDb {
  getWorkflowBlockTypes(workflowId: string): Promise<string[]>;
  createWorkflowBlock(data: { workflowId: string; type: string; input: string; description: string; isTrigger: boolean; isBlock: boolean }): Promise<{
    id: string;
    workflowId: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    description: string;
    isTrigger: boolean;
    isBlock: boolean;
    input: string;
  }>;
  updateWorkflowBlock(
    id: string,
    data: {
      type?: string | undefined;
      input?: string | undefined;
      description?: string | undefined;
      isTrigger?: boolean | undefined;
      isBlock?: boolean | undefined;
    }
  ): Promise<{
    id: string;
    workflowId: string;
    createdAt: Date;
    updatedAt: Date;
    type: string;
    description: string;
    isTrigger: boolean;
    isBlock: boolean;
    input: string;
  }>;
}
