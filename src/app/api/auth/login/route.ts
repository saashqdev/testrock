import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { getServerTranslations } from "@/i18n/server";
import { db } from "@/db";
import { NextRequest } from "next/server";

export async function POST(request: NextRequest) {
  const { t } = await getServerTranslations();
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ error: t("shared.invalidRequest") }, { status: 400 });
    }
    const email = body.email;
    const password = body.password;

    if (typeof email !== "string" || typeof password !== "string") {
      return Response.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const user = await db.users.getUserByEmail(email);
    if (!user) {
      return Response.json({ error: "Invalid email or password" }, { status: 400 });
    }

    const isCorrectPassword = await bcrypt.compare(password, (user as any).passwordHash);
    if (!isCorrectPassword) {
      return Response.json({ error: "Invalid email or password" }, { status: 400 });
    }

    await db.logs.createLogLogin(request, user);
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, { expiresIn: "1h" });
    return Response.json({ token, user: { id: user.id, email: user.email } });
  } catch (e: any) {
    return Response.json(
      {
        error: e.message,
        stack: e.stack,
      },
      { status: 401 }
    );
  }
}
