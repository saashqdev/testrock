"use server";

import { RolesPermissionsSeed } from "./seed.server";

export async function seedRolesPermissionsAction(formData: FormData) {
  return await RolesPermissionsSeed.action(formData);
}
