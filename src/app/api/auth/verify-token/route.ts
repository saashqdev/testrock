import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("Authorization")?.split(" ")[1];

    if (!token) {
      return Response.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);
    return Response.json({ userId: decoded.userId, message: "Token is valid" });
  } catch (e: any) {
    return Response.json({ error: "Token is not valid or expired: " + e.message }, { status: 401 });
  }
}
