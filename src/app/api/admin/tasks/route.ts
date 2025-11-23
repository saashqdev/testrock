import { NextRequest, NextResponse } from "next/server";
import { getTasks } from "@/utils/api/server/RowsApi";
import { db } from "@/db";
import { getUserInfo } from "@/lib/services/session.server";

export async function GET(request: NextRequest) {
  try {
    const userInfo = await getUserInfo();

    const tasks = await getTasks({
      assignedOrCreatedUserId: userInfo.userId,
    });

    const allEntities = await db.entities.getAllEntities(null);

    return NextResponse.json({
      tasks,
      allEntities,
    });
  } catch (error) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}
