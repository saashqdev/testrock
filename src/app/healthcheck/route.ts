// learn more: https://fly.io/docs/reference/configuration/#services-http_checks
import { prisma } from "@/db/config/prisma/database";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const host = request.headers.get("x-forwarded-host") ?? request.headers.get("host");
  const detailed = request.nextUrl.searchParams.get("detailed") === "true";

  const checks: Record<string, { status: string; error?: string; duration?: number }> = {};

  // Database check
  try {
    const dbStart = Date.now();
    await prisma.appConfiguration.count();
    checks.database = { status: "ok", duration: Date.now() - dbStart };
  } catch (error: any) {
    checks.database = { status: "error", error: error.message };
    console.error("Database healthcheck failed:", error);
  }

  // Server check
  try {
    const serverStart = Date.now();
    const url = new URL("/", `http://${host}`);
    await fetch(url.toString(), { method: "HEAD", signal: AbortSignal.timeout(5000) }).then((r) => {
      if (!r.ok) {
        throw new Error(`Server returned ${r.status}`);
      }
    });
    checks.server = { status: "ok", duration: Date.now() - serverStart };
  } catch (error: any) {
    checks.server = { status: "error", error: error.message };
    console.error("Server healthcheck failed:", error);
  }

  // Redis check (optional)
  try {
    if (process.env.REDIS_URL) {
      const redisStart = Date.now();
      const { createClient } = await import("redis");
      const client = createClient({ url: process.env.REDIS_URL });
      await client.connect();
      await client.ping();
      await client.disconnect();
      checks.redis = { status: "ok", duration: Date.now() - redisStart };
    } else {
      checks.redis = { status: "disabled", error: "REDIS_URL not configured" };
    }
  } catch (error: any) {
    checks.redis = { status: "error", error: error.message };
    console.error("Redis healthcheck failed:", error);
  }

  const allOk = Object.values(checks).every((check) => check.status === "ok" || check.status === "disabled");

  if (detailed) {
    return NextResponse.json(
      {
        status: allOk ? "healthy" : "unhealthy",
        timestamp: new Date().toISOString(),
        checks,
        environment: {
          nodeEnv: process.env.NODE_ENV,
          hasRedis: !!process.env.REDIS_URL,
        },
      },
      { status: allOk ? 200 : 503 }
    );
  }

  if (allOk) {
    return new NextResponse("OK", { status: 200 });
  } else {
    console.log("healthcheck ❌", { checks });
    return new NextResponse("Service Unavailable", { status: 503 });
  }
}
