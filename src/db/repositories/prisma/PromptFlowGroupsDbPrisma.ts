import { IPromptFlowGroupsDb } from "@/db/interfaces/promptFlows/IPromptFlowGroupsDb";
import { Prisma } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { PromptFlowGroupWithDetailsDto } from "@/db/models/promptFlows/PromptFlowGroupsModel";

export class PromptFlowGroupsDbPrisma implements IPromptFlowGroupsDb {
  async getAllPromptFlowGroups(): Promise<PromptFlowGroupWithDetailsDto[]> {
    return await prisma.promptFlowGroup.findMany({
      include: {
        templates: { orderBy: { order: "asc" } },
        promptFlows: true,
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getPromptFlowGroup(id: string): Promise<PromptFlowGroupWithDetailsDto | null> {
    return await prisma.promptFlowGroup.findUnique({
      where: { id },
      include: {
        templates: { orderBy: { order: "asc" } },
        promptFlows: true,
      },
    });
  }

  async getPromptFlowGroupByTitle(title: string): Promise<PromptFlowGroupWithDetailsDto | null> {
    return await prisma.promptFlowGroup.findFirst({
      where: { title },
      include: {
        templates: { orderBy: { order: "asc" } },
        promptFlows: true,
      },
    });
  }

  async createPromptFlowGroup(data: {
    order: number;
    title: string;
    description: string;
    templates: {
      order: number;
      title: string;
    }[];
  }): Promise<PromptFlowGroupWithDetailsDto> {
    return await prisma.promptFlowGroup.create({
      data: {
        order: data.order,
        title: data.title,
        description: data.description,
        templates: { create: data.templates },
      },
      include: {
        templates: { orderBy: { order: "asc" } },
        promptFlows: true,
      },
    });
  }

  async updatePromptFlowGroup(
    id: string,
    data: {
      order?: number;
      title?: string;
      description?: string;
      templates?: {
        id?: string;
        order: number;
        title: string;
      }[];
    }
  ): Promise<PromptFlowGroupWithDetailsDto> {
    const update: Prisma.PromptFlowGroupUncheckedUpdateInput = {
      title: data.title,
      description: data.description,
    };
    if (data.templates) {
      update.templates = {
        deleteMany: {},
        create: data.templates.map((s) => ({
          order: s.order,
          title: s.title,
        })),
      };
    }
    return await prisma.promptFlowGroup.update({
      where: { id },
      data: update,
      include: {
        templates: { orderBy: { order: "asc" } },
        promptFlows: true,
      },
    });
  }

  async deletePromptFlowGroup(id: string): Promise<PromptFlowGroupWithDetailsDto> {
    return await prisma.promptFlowGroup.delete({
      where: { id },
      include: {
        templates: { orderBy: { order: "asc" } },
        promptFlows: true,
      },
    });
  }
}
