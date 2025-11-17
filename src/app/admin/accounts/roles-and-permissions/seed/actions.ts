"use server";

import { action } from "./seed.server";

export async function seedRolesPermissionsAction(formData: FormData) {
  return await action(formData);
}
