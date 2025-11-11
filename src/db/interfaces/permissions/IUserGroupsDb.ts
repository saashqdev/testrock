import { Prisma } from "@prisma/client";

export interface IUserGroupsDb {
  createUserGroup(
    userId: string,
    groupId: string
  ): Promise<{
    id: string;
    groupId: string;
    userId: string;
  }>;
  deleteUserGroup(userId: string, groupId: string): Promise<Prisma.BatchPayload>;
  deleteGroupUsers(groupId: string): Promise<Prisma.BatchPayload>;
}
