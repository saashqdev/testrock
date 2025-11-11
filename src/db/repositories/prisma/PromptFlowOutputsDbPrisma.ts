import { IPromptFlowOutputsDb } from "@/db/interfaces/promptFlows/IPromptFlowOutputsDb";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { prisma } from "@/db/config/prisma/database";
import { PromptFlowOutput } from "@prisma/client";

export class PromptFlowOutputsDbPrisma implements IPromptFlowOutputsDb {
  async getPromptFlowOutputs(promptFlowId: string): Promise<PromptFlowOutputWithDetailsDto[]> {
    return await prisma.promptFlowOutput.findMany({
      where: { promptFlowId },
      include: {
        entity: { select: { id: true, name: true, title: true } },
        mappings: {
          include: {
            promptTemplate: true,
            property: { select: { id: true, name: true, title: true, type: true } },
          },
        },
      },
    });
  }

  async getPromptFlowOutput(id: string): Promise<PromptFlowOutputWithDetailsDto | null> {
    return await prisma.promptFlowOutput.findUnique({
      where: { id },
      include: {
        entity: { select: { id: true, name: true, title: true } },
        mappings: {
          include: {
            promptTemplate: true,
            property: { select: { id: true, name: true, title: true, type: true } },
          },
        },
      },
    });
  }

  async createPromptFlowOutput(data: { promptFlowId: string; type: string; entityId: string }) {
    return await prisma.promptFlowOutput.create({
      data: {
        promptFlowId: data.promptFlowId,
        type: data.type,
        entityId: data.entityId,
      },
    });
  }

  async updatePromptFlowOutput(id: string, data: { type: string; entityId: string }) {
    return await prisma.promptFlowOutput.update({
      where: {
        id,
      },
      data: {
        type: data.type,
        entityId: data.entityId,
      },
    });
  }

  async deletePromptFlowOutput(id: string): Promise<PromptFlowOutput> {
    return await prisma.promptFlowOutput.delete({ where: { id } });
  }
}
