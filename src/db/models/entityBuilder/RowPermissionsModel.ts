import { RowPermission } from "@prisma/client";

export type RowPermissionsModel = {
  canRead: boolean;
  canWrite: boolean;
  canDelete: boolean;
};

export type RowPermissionsWithDetailsDto = RowPermission & {
  tenant: { id: string; name: string } | null;
  role?: { id: string; name: string } | null;
  group?: { id: string; name: string } | null;
  user?: { id: string; email: string } | null;
};
