import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { setUserRoles } from "@/utils/services/userService";
import { db } from "@/db";

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.users.view");
    await verifyUserHasPermission("admin.accounts.create");

    const { t } = await getServerTranslations();
    const body = await request.json();

    const { email, firstName, lastName, password, roles } = body;

    const arrRoles: { id: string; tenantId: string | undefined }[] = roles || [];

    if (!email || !password || !firstName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const existingUser = await db.users.getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json({ error: "User already exists with that email." }, { status: 400 });
    }

    const allRoles = await db.roles.getRoles(arrRoles.map((r) => r.id));
    const setRoles: { role: RoleWithPermissionsDto; tenantId: string | null }[] = [];
    arrRoles.forEach(({ id, tenantId }) => {
      const role = allRoles.find((r) => r.id === id);
      if (!role) {
        throw new Error("Role not found with ID: " + id);
      }
      setRoles.push({ role, tenantId: tenantId ?? null });
    });

    const isAdmin = setRoles.some((r) => r.role.type === "admin");

    const { id } = await db.users.register({
      email,
      firstName,
      lastName: lastName ?? "",
      username: email,
      password,
      request,
    });
    const user = await db.users.getUser(id);
    if (!user) {
      return NextResponse.json({ error: "Unexpected error while creating user." }, { status: 400 });
    }

    await setUserRoles({ user, roles: setRoles, isAdmin, type: "admin" });

    return NextResponse.json({ success: "User created successfully" }, { status: 200 });
  } catch (error) {
    const { t } = await getServerTranslations();
    return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
}
