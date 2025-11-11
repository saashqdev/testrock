import { NextRequest, NextResponse } from "next/server";
import SeedService from "@/modules/core/services/SeedService";

export async function POST(request: NextRequest) {
  // Only allow in development mode
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "development-only" }, { status: 404 });
  }

  try {
    const body = await request.json();
    const action = body.action;

    if (action === "seed") {
      await SeedService.seed();
      return NextResponse.json({ action, success: "Database seeded" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}
