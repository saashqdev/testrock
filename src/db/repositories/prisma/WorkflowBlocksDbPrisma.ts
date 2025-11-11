import { IWorkflowBlocksDb } from "@/db/interfaces/workflows/IWorkflowBlocksDb";
import { prisma } from "@/db/config/prisma/database";

export class WorkflowBlocksDbPrisma implements IWorkflowBlocksDb {
  async getWorkflowBlockTypes(workflowId: string) {
    const workflowBlocks = await prisma.workflowBlock.findMany({
      where: {
        workflowId,
      },
      select: { type: true },
    });
    return workflowBlocks.map((block) => block.type);
  }

  async createWorkflowBlock(data: {
    workflowId: string;
    type: string;
    input: string;
    description: string;
    isTrigger: boolean;
    isBlock: boolean;
    // positionX: number;
    // positionY: number;
  }) {
    return await prisma.workflowBlock.create({
      data: {
        workflowId: data.workflowId,
        type: data.type,
        description: data.description,
        isTrigger: data.isTrigger,
        isBlock: data.isBlock,
        input: data.input,
        // positionX: data.positionX,
        // positionY: data.positionY,
      },
    });
  }

  async updateWorkflowBlock(
    id: string,
    data: {
      type?: string;
      input?: string;
      description?: string;
      isTrigger?: boolean;
      isBlock?: boolean;
    }
  ) {
    return await prisma.workflowBlock.update({
      where: { id },
      data: {
        type: data.type,
        description: data.description,
        input: data.input,
        isTrigger: data.isTrigger,
        isBlock: data.isBlock,
        // positionX: data.positionX,
        // positionY: data.positionY,
      },
    });
  }
}
