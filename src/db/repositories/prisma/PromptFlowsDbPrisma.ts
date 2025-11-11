import { IPromptFlowsDb } from "@/db/interfaces/promptFlows/IPromptFlowsDb";
import { prisma } from "@/db/config/prisma/database";
import { Prisma } from "@prisma/client";
import { PromptFlowWithDetailsDto, PromptFlowWithExecutionsDto, CreatePromptFlowDto } from "@/db/models/promptFlows/PromptFlowsModel";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { db } from "@/db";

const includeOutputs = {
  include: {
    entity: { select: { id: true, name: true, title: true } },
    mappings: {
      include: {
        promptTemplate: true,
        property: { select: { id: true, name: true, title: true } },
      },
    },
  },
};

export class PromptFlowsDbPrisma implements IPromptFlowsDb {
  async getPromptFlows({ isPublic }: { isPublic?: boolean } = {}): Promise<PromptFlowWithDetailsDto[]> {
    return await prisma.promptFlow.findMany({
      where: {
        public: isPublic,
      },
      include: {
        promptFlowGroup: true,
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
      orderBy: [{ promptFlowGroup: { title: "asc" } }, { createdAt: "desc" }],
    });
  }

  async getPromptFlowsWithExecutions({ isPublic }: { isPublic?: boolean } = {}): Promise<PromptFlowWithExecutionsDto[]> {
    return await prisma.promptFlow.findMany({
      where: {
        public: isPublic,
      },
      include: {
        promptFlowGroup: true,
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
        executions: {
          include: {
            user: { select: UserModelHelper.selectSimpleUserProperties },
            tenant: true,
            results: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
      orderBy: [{ promptFlowGroup: { title: "asc" } }, { createdAt: "desc" }],
    });
  }

  async getPromptFlow(id: string): Promise<PromptFlowWithDetailsDto | null> {
    return await prisma.promptFlow.findUnique({
      where: { id },
      include: {
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
    });
  }

  async getPromptFlowsByEntity(entityId: string): Promise<PromptFlowWithDetailsDto[]> {
    return await prisma.promptFlow.findMany({
      where: {
        OR: [
          { inputEntityId: entityId },
          {
            outputs: {
              some: {
                entityId,
              },
            },
          },
        ],
      },
      include: {
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
    });
  }

  async getPromptFlowsByEntityName(entityName: string): Promise<PromptFlowWithDetailsDto[]> {
    return await prisma.promptFlow.findMany({
      where: {
        OR: [
          { inputEntity: { name: entityName } },
          {
            outputs: {
              some: {
                entity: { name: entityName },
              },
            },
          },
        ],
      },
      include: {
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
    });
  }

  async getPromptFlowByName(title: string): Promise<PromptFlowWithDetailsDto | null> {
    return await prisma.promptFlow.findFirst({
      where: { title },
      include: {
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
    });
  }

  async getPromptFlowWithExecutions(id: string): Promise<PromptFlowWithExecutionsDto | null> {
    return await prisma.promptFlow.findUnique({
      where: { id },
      include: {
        promptFlowGroup: true,
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
        executions: {
          include: {
            user: { select: UserModelHelper.selectSimpleUserProperties },
            tenant: true,
            results: { orderBy: { order: "desc" } },
          },
          orderBy: [{ createdAt: "desc" }],
        },
      },
    });
  }

  async createPromptFlow(data: CreatePromptFlowDto): Promise<PromptFlowWithDetailsDto> {
    return await prisma.promptFlow.create({
      data: {
        model: data.model,
        stream: data.stream,
        title: data.title,
        description: data.description,
        actionTitle: data.actionTitle,
        executionType: data.executionType,
        promptFlowGroupId: data.promptFlowGroupId,
        inputEntityId: data.inputEntityId,
        templates: { create: data.templates },
        inputVariables: { create: data.inputVariables },
        public: data.isPublic,
        outputs: {
          create: data.outputs?.map((o) => {
            return {
              type: o.type,
              entityId: o.entityId,
              mappings: { create: o.mappings },
            };
          }),
        },
      },
      include: {
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
    });
  }

  async updatePromptFlow(
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
  ): Promise<PromptFlowWithDetailsDto> {
    const outputs = await db.promptFlowOutput.getPromptFlowOutputs(id);
    const update: Prisma.PromptFlowUncheckedUpdateInput = {
      model: data.model,
      stream: data.stream,
      title: data.title,
      description: data.description,
      actionTitle: data.actionTitle,
      executionType: data.executionType,
      promptFlowGroupId: data.promptFlowGroupId,
      inputEntityId: data.inputEntityId,
      public: data.isPublic,
    };
    if (data.templates) {
      update.templates = {
        deleteMany: {},
        create: data.templates.map((s) => ({
          order: s.order,
          title: s.title,
          template: s.template,
          temperature: s.temperature,
          maxTokens: s.maxTokens,
        })),
      };
    }
    if (data.outputs) {
      update.outputs = {
        deleteMany: {},
        create: data.outputs.map((s) => ({
          type: s.type,
          entityId: s.entityId,
          mappings: {
            create: s.mappings.map((o) => ({
              promptTemplateId: o.promptTemplateId,
              propertyId: o.propertyId,
            })),
          },
        })),
      };
    }
    const updated = await prisma.promptFlow.update({
      where: { id },
      data: update,
      include: {
        inputVariables: true,
        inputEntity: { select: { id: true, name: true, title: true } },
        templates: { orderBy: { order: "asc" } },
        outputs: includeOutputs,
      },
    });

    // since templates are recreated, we need to recreate the mappings
    await Promise.all(
      outputs.map(async (output) => {
        return output.mappings.map(async (mapping) => {
          const template = updated.templates.find((t) => t.title === mapping.promptTemplate.title);
          if (template) {
            await prisma.promptFlowOutputMapping
              .create({
                data: {
                  promptFlowOutputId: output.id,
                  promptTemplateId: template.id,
                  propertyId: mapping.propertyId,
                },
              })
              .catch((e) => {
                // console.error(e);
              });
          }
        });
      })
    );
    return updated;
  }

  async deletePromptFlow(id: string) {
    await prisma.promptTemplateResult.deleteMany({ where: { flowExecution: { flowId: id } } });
    await prisma.promptFlowExecution.deleteMany({ where: { flowId: id } });
    return await prisma.promptFlow.delete({ where: { id } });
  }
}
