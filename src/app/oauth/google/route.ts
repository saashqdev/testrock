import { NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { getAuthenticator } from "@/utils/auth/auth.server";

// GET handler - redirect to login
export async function GET() {
  redirect("/login");
}

// POST handler - authenticate with Google
export async function POST(request: NextRequest) {
  return getAuthenticator().authenticate("google", request);
}
