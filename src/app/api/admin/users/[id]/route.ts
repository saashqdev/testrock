import { NextRequest, NextResponse } from "next/server";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await verifyUserHasPermission("admin.users.view");
    const { t } = await getServerTranslations();
    
    const { id } = await params;
    const body = await request.json();
    const { email, firstName, lastName, password } = body;

    if (!email || !firstName) {
      return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
    }

    const user = await db.users.getUser(id);
    if (!user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    // Check if email is being changed and if it's already taken
    if (email !== user.email) {
      const existingUser = await db.users.getUserByEmail(email);
      if (existingUser && existingUser.id !== id) {
        return NextResponse.json({ error: "Email already in use." }, { status: 400 });
      }
    }

    // Update user
    const updateData: any = {
      email,
      firstName,
      lastName: lastName ?? "",
    };

    // Only update password if provided
    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateData.passwordHash = passwordHash;
    }

    await db.users.update(id, updateData);

    return NextResponse.json({ success: "User updated successfully" }, { status: 200 });
  } catch (error) {
    const { t } = await getServerTranslations();
    return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
}
