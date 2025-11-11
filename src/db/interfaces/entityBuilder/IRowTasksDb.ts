import { RowTaskWithDetailsDto } from "@/db/models/entityBuilder/RowTasksModel";

export interface IRowTasksDb {
  getRowTasks(rowId: string): Promise<RowTaskWithDetailsDto[]>;
  getRowTask(id: string): Promise<RowTaskWithDetailsDto | null>;
  createRowTask(data: {
    createdByUserId: string;
    rowId: string;
    title: string;
    description?: string | undefined;
    completed?: boolean | undefined;
    completedAt?: Date | null | undefined;
    completedByUserId?: string | null | undefined;
    assignedToUserId?: string | null | undefined;
    deadline?: Date | null | undefined;
  }): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    rowId: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt: Date | null;
    completedByUserId: string | null;
    assignedToUserId: string | null;
    deadline: Date | null;
  }>;
  updateRowTask(
    id: string,
    data: {
      createdByUserId?: string | undefined;
      rowId?: string | undefined;
      title?: string | undefined;
      description?: string | undefined;
      completed?: boolean | undefined;
      completedAt?: Date | null | undefined;
      completedByUserId?: string | null | undefined;
      assignedToUserId?: string | null | undefined;
      deadline?: Date | null | undefined;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    rowId: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt: Date | null;
    completedByUserId: string | null;
    assignedToUserId: string | null;
    deadline: Date | null;
  }>;
  deleteRowTask(id: string): Promise<{
    id: string;
    createdAt: Date;
    createdByUserId: string;
    rowId: string;
    title: string;
    description: string;
    completed: boolean;
    completedAt: Date | null;
    completedByUserId: string | null;
    assignedToUserId: string | null;
    deadline: Date | null;
  }>;
  getAllRowTasks({
    completed,
    assignedOrCreatedUserId,
  }: {
    completed?: boolean | undefined;
    assignedOrCreatedUserId?: string | undefined;
  }): Promise<RowTaskWithDetailsDto[]>;
}
