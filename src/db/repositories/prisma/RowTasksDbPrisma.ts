import { IRowTasksDb } from "@/db/interfaces/entityBuilder/IRowTasksDb";
import { prisma } from "@/db/config/prisma/database";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { RowTaskWithDetailsDto } from "@/db/models/entityBuilder/RowTasksModel";
import { Prisma } from "@prisma/client";

export class RowTasksDbPrisma implements IRowTasksDb {
  async getRowTasks(rowId: string): Promise<RowTaskWithDetailsDto[]> {
    return await prisma.rowTask.findMany({
      where: {
        rowId,
      },
      include: {
        ...UserModelHelper.includeSimpleCreatedByUser,
        assignedToUser: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            admin: true,
            defaultTenantId: true,
            locale: true,
            avatar: true,
            phone: true,
            githubId: true,
            googleId: true,
            createdAt: true,
          },
        },
        row: {
          include: {
            createdByUser: { select: UserModelHelper.selectWithAvatar }, // Ensure this includes admin, defaultTenantId, avatar
            createdByApiKey: true,
            values: { include: { media: true, multiple: true, range: true } },
          },
        },
      },
      orderBy: [
        {
          completed: "asc",
        },
        {
          createdAt: "asc",
        },
      ],
    });
  }

  async getRowTask(id: string): Promise<RowTaskWithDetailsDto | null> {
    return await prisma.rowTask.findUnique({
      where: {
        id,
      },
      include: {
        ...UserModelHelper.includeSimpleCreatedByUser,
        assignedToUser: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            admin: true,
            defaultTenantId: true,
            locale: true,
            avatar: true,
            phone: true,
            githubId: true,
            googleId: true,
            createdAt: true,
          },
        },
        row: {
          include: {
            createdByUser: { select: UserModelHelper.selectWithAvatar },
            createdByApiKey: true,
            values: { include: { media: true, multiple: true, range: true } },
          },
        },
      },
    });
  }

  async createRowTask(data: {
    createdByUserId: string;
    rowId: string;
    title: string;
    description?: string;
    completed?: boolean;
    completedAt?: Date | null;
    completedByUserId?: string | null;
    assignedToUserId?: string | null;
    deadline?: Date | null;
  }) {
    return await prisma.rowTask.create({
      data: {
        createdByUserId: data.createdByUserId,
        rowId: data.rowId,
        title: data.title,
        description: data.description ?? "",
        completed: data.completed ?? false,
        completedAt: data.completedAt ?? null,
        completedByUserId: data.completedByUserId ?? null,
        assignedToUserId: data.assignedToUserId ?? null,
        deadline: data.deadline ?? null,
      },
    });
  }

  async updateRowTask(
    id: string,
    data: {
      createdByUserId?: string;
      rowId?: string;
      title?: string;
      description?: string;
      completed?: boolean;
      completedAt?: Date | null;
      completedByUserId?: string | null;
      assignedToUserId?: string | null;
      deadline?: Date | null;
    }
  ) {
    return await prisma.rowTask.update({
      where: {
        id,
      },
      data,
    });
  }

  async deleteRowTask(id: string) {
    return await prisma.rowTask.delete({
      where: {
        id,
      },
    });
  }

  async getAllRowTasks({ completed, assignedOrCreatedUserId }: { completed?: boolean; assignedOrCreatedUserId?: string }): Promise<RowTaskWithDetailsDto[]> {
    const userWhere: Prisma.RowTaskWhereInput = {};
    if (assignedOrCreatedUserId) {
      userWhere.OR = [
        {
          createdByUserId: assignedOrCreatedUserId,
        },
        {
          assignedToUserId: assignedOrCreatedUserId,
        },
      ];
    }
    return await prisma.rowTask.findMany({
      where: {
        completed,
        ...userWhere,
      },
      include: {
        ...UserModelHelper.includeSimpleCreatedByUser,
        assignedToUser: {
          select: {
            id: true,
            email: true,
            username: true,
            firstName: true,
            lastName: true,
            admin: true,
            defaultTenantId: true,
            locale: true,
            avatar: true,
            phone: true,
            githubId: true,
            googleId: true,
            createdAt: true,
          },
        },
        row: {
          include: {
            createdByUser: { select: UserModelHelper.selectWithAvatar },
            createdByApiKey: true,
            values: { include: { media: true, multiple: true, range: true } },
          },
        },
      },
      orderBy: [
        {
          createdAt: "desc",
        },
      ],
    });
  }
}
