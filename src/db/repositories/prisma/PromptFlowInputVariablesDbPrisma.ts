import { IPromptFlowInputVariablesDb } from "@/db/interfaces/promptFlows/IPromptFlowInputVariablesDb";
import { PromptFlowInputVariableWithDetailsDto } from "@/db/models/promptFlows/PromptFlowInputVariablesModel";
import { prisma } from "@/db/config/prisma/database";
import { PromptFlowInputVariable } from "@prisma/client";

export class PromptFlowInputVariablesDbPrisma implements IPromptFlowInputVariablesDb {
  async getPromptFlowVariables(promptFlowId: string): Promise<PromptFlowInputVariableWithDetailsDto[]> {
    return await prisma.promptFlowInputVariable.findMany({
      where: { promptFlowId },
    });
  }

  async getPromptFlowVariable(id: string): Promise<PromptFlowInputVariableWithDetailsDto | null> {
    return await prisma.promptFlowInputVariable.findUnique({
      where: { id },
    });
  }

  async createPromptFlowVariable(data: { promptFlowId: string; type: string; name: string; title: string; isRequired: boolean }) {
    return await prisma.promptFlowInputVariable.create({
      data: {
        promptFlowId: data.promptFlowId,
        type: data.type,
        name: data.name,
        title: data.title,
        isRequired: data.isRequired,
      },
    });
  }

  async updatePromptFlowVariable(id: string, data: { type: string; name: string; title: string; isRequired: boolean }) {
    return await prisma.promptFlowInputVariable.update({
      where: {
        id,
      },
      data: {
        type: data.type,
        name: data.name,
        title: data.title,
        isRequired: data.isRequired,
      },
    });
  }

  async deletePromptFlowVariable(id: string): Promise<PromptFlowInputVariable> {
    return await prisma.promptFlowInputVariable.delete({
      where: { id },
    });
  }
}
