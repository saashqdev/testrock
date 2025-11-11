import { IUserGroupsDb } from "@/db/interfaces/accounts/IUserGroupsDb";
import { prisma } from "@/db/config/prisma/database";

export class UserGroupsDbPrisma implements IUserGroupsDb {
  async createUserGroup(userId: string, groupId: string) {
    return await prisma.groupUser.create({
      data: {
        userId,
        groupId,
      },
    });
  }

  async deleteUserGroup(userId: string, groupId: string) {
    return await prisma.groupUser.deleteMany({
      where: {
        userId,
        groupId,
      },
    });
  }

  async deleteGroupUsers(groupId: string) {
    return await prisma.groupUser.deleteMany({
      where: {
        groupId,
      },
    });
  }
}
