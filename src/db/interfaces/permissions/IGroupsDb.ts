import { GroupModel } from "@/db/models/permissions/GroupsModel";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
export interface IGroupsDb {
  getAllGroups(tenantId: string | null): Promise<GroupWithDetailsDto[]>;
  getGroups(tenantId: string | null, ids: string[]): Promise<GroupWithDetailsDto[]>;
  getMyGroups(userId: string, tenantId: string | null): Promise<GroupWithDetailsDto[]>;
  getGroup(id: string): Promise<GroupWithDetailsDto | null>;
  createGroup(data: { createdByUserId: string; tenantId: string | null; name: string; description: string; color: number }): Promise<GroupModel>;
  updateGroup(id: string, data: { name?: string; description?: string; color?: number }): Promise<GroupModel>;
  deleteGroup(id: string): Promise<{
    name: string;
    id: string;
    createdAt: Date;
    createdByUserId: string;
    tenantId: string | null;
    description: string;
    color: number;
  }>;
}
