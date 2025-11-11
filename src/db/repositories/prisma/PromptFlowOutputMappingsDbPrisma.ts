import { IPromptFlowOutputMappingsDb } from "@/db/interfaces/promptFlows/IPromptFlowOutputMappingsDb";
import { prisma } from "@/db/config/prisma/database";
import { PromptFlowOutputMapping } from "@prisma/client";
import { PromptFlowOutputMappingWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputMappingsModel";

export class PromptFlowOutputMappingsDbPrisma implements IPromptFlowOutputMappingsDb {
  async getPromptFlowOutputMapping(id: string): Promise<PromptFlowOutputMappingWithDetailsDto | null> {
    return await prisma.promptFlowOutputMapping.findUnique({
      where: { id },
      include: {
        promptTemplate: true,
        property: { select: { id: true, name: true, title: true } },
      },
    });
  }

  async createPromptFlowOutputMapping(data: { promptFlowOutputId: string; promptTemplateId: string; propertyId: string }) {
    return await prisma.promptFlowOutputMapping.create({
      data: {
        promptFlowOutputId: data.promptFlowOutputId,
        promptTemplateId: data.promptTemplateId,
        propertyId: data.propertyId,
      },
    });
  }

  async updatePromptFlowOutputMapping(id: string, data: { promptTemplateId: string; propertyId: string }) {
    return await prisma.promptFlowOutputMapping.update({
      where: { id },
      data: {
        promptTemplateId: data.promptTemplateId,
        propertyId: data.propertyId,
      },
    });
  }

  async deletePromptFlowOutputMapping(id: string): Promise<PromptFlowOutputMapping> {
    return await prisma.promptFlowOutputMapping.delete({
      where: { id },
    });
  }
}
