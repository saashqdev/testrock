import { WorkflowBlock, WorkflowBlockCondition, WorkflowBlockConditionGroup, WorkflowBlockToBlock } from "@prisma/client";

export type WorkflowBlocksModel = {
  id: string;
  workflowId: string;
  type: "input" | "output" | "action";
  position: {
    x: number;
    y: number;
  };
  createdAt: Date;
  updatedAt: Date;
};

export type WorkflowBlockWithDetailsDto = WorkflowBlock & {
  toBlocks: (WorkflowBlockToBlock & {
    toBlock: WorkflowBlock;
  })[];
  conditionsGroups: (WorkflowBlockConditionGroup & {
    conditions: WorkflowBlockCondition[];
  })[];
};
