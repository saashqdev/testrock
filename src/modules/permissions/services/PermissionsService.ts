import { db } from "@/db";
import { PermissionsModel } from "@/db/models/permissions/PermissionsModel";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";

export async function getPermissionName(name: string): Promise<PermissionsModel | null> {
  return await cachified({
    key: `permission:${name}`,
    ttl: 1000 * 60 * 60 * 24,
    getFreshValue: () => db.permissions.getPermissionByName(name),
  });
}

export async function createPermissions(
  permissions: { inRoles: string[]; name: string; description: string; type: string }[],
  fromOrder: number = 0
): Promise<void> {
  const allRolePermissions = await db.rolePermissions.getAllRolePermissions();
  let allPermissions = await db.permissions.getAllPermissions();
  let createdPermissionNames: string[] = [];
  await Promise.all(
    permissions.map(async (data, idx) => {
      const existing = allPermissions.find((p) => p.name === data.name);
      if (existing || createdPermissionNames.includes(data.name)) {
        // eslint-disable-next-line no-console
        console.log("ℹ️ Permission name already exists: " + data.name);
        return;
      }
      const permissionId = await db.permissions.createPermission({
        order: fromOrder + idx + 1,
        name: data.name,
        description: data.description,
        type: data.type,
        isDefault: true,
        entityId: null,
      });
      const permission = await db.permissions.getPermission(permissionId.id ?? permissionId);
      if (!permission) {
        throw new Error("Could not create permission: " + data.name);
      }
      createdPermissionNames.push(permission.name);

      await Promise.all(
        data.inRoles.map(async (inRole) => {
          const roles = await db.roles.getRolesByName([inRole]);
          const role = roles && roles.length > 0 ? roles[0] : null;
          if (!role) {
            throw new Error("Role required: " + inRole);
          }
          const existing = allRolePermissions.find((p) => p.roleId === role.id && p.permission.name === permission.name);
          if (existing) {
            return existing;
          }
          await createRolePermission({
            permissionId: permission.id,
            roleId: role.id,
          });
        })
      );
    })
  );
}

export async function updatePermission(
  id: string,
  data: {
    name?: string;
    description?: string;
    type?: string;
    order?: number;
  }
): Promise<void> {
  const item = await db.permissions.getPermission(id);
  if (!item) {
    return;
  }
  await db.permissions.updatePermission(id, data).then(() => {
    clearCacheKey(`permission:${item.name}`);
    clearCacheKey(`permission:${data.name}`);
  });
}

export async function deletePermission(id: string): Promise<void> {
  const item = await db.permissions.getPermission(id);
  if (!item) {
    return;
  }
  await db.permissions.deletePermission(id).then(() => {
    clearCacheKey(`permission:${item.name}`);
  });
}

export async function createRolePermission(data: { roleId: string; permissionId: string }): Promise<string> {
  const existing = await db.rolePermissions.getRolePermission(data.roleId, data.permissionId);
  if (existing) {
    return existing.id;
  }
  const created = await db.rolePermissions.createRolePermission({
    roleId: data.roleId,
    permissionId: data.permissionId,
  });
  return created.id ?? created;
}

export async function setRolePermissions(roleId: string, permissionNames: string[]): Promise<void> {
  await db.rolePermissions.deleteRolePermissionById(roleId);

  permissionNames.map(async (name) => {
    const permission = await db.permissions.getPermissionByName(name);
    if (permission) {
      await db.rolePermissions.createRolePermission({
        roleId,
        permissionId: permission.id,
      });
    }
  });
}

export async function setPermissionRoles(permissionId: string, roleNames: string[]): Promise<void> {
  await db.rolePermissions.deleteRolePermissionById(permissionId);

  roleNames.map(async (name) => {
    const role = await db.roles.getRoleByName(name);
    if (role) {
      await db.rolePermissions.createRolePermission({
        roleId: role.id,
        permissionId,
      });
    }
  });
}
