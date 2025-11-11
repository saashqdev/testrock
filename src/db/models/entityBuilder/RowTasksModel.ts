import { RowTask } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";
import { RowWithValuesDto } from "@/db/models/entityBuilder/RowsModel";

export type RowTasksModel = {
  id: string;
  name: string;
  description?: string;
  isCompleted: boolean;
};

export type RowTaskWithDetailsDto = RowTask & {
  createdByUser: UserDto;
  assignedToUser: UserDto | null;
  row: RowWithValuesDto;
};
