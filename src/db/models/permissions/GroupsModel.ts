import { Group, GroupUser } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type GroupModel = {
  id: string;
  name: string;
  description?: string;
};

export type GroupWithDetailsDto = Group & {
  users: (GroupUser & { user: UserDto })[];
};
