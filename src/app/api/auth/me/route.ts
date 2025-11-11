import jwt from "jsonwebtoken";
import { db } from "@/db";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    const user = await db.users.getUser(decoded.userId);
    return Response.json({ user });
  } catch (e: any) {
    return Response.json({ error: "Token is not valid or expired: " + e.message }, { status: 401 });
  }
}
