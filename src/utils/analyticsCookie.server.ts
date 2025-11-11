"use server";

import { randomBytes } from "crypto";
import { Session } from "inspector";
import { cookies } from "next/headers";

export type AnalyticsSession = {
  userAnalyticsId: string;
};

const sessionSecret = process.env.SESSION_SECRET;
if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set");
}

export async function createCookieSessionStorage() {
  const cookieStore = await cookies();
  if (typeof sessionSecret === "string") {
    cookieStore.set("therock_analytics", sessionSecret, {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      httpOnly: true,
    });
  }
}

export async function getAnalyticsSession(request: Request) {
  return sessionStorage.getSession(request.headers.get("Cookie"));
}

export async function getAnalyticsInfo(request: Request): Promise<AnalyticsSession> {
  const session = await getAnalyticsSession(request);
  const userAnalyticsId = session.get("userAnalyticsId") ?? null;
  return {
    userAnalyticsId,
  };
}

export async function createAnalyticsSession(analyticsSession: AnalyticsSession, redirectTo = "/") {
  const session = await sessionStorage.getSession();
  session.set("userAnalyticsId", analyticsSession.userAnalyticsId);
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}

export async function commitAnalyticsSession(session: Session) {
  return await sessionStorage.commitSession(session);
}

export async function destroyAnalyticsSession(session: Session) {
  return await sessionStorage.destroySession(session);
}

export async function generateAnalyticsUserId() {
  return randomBytes(100).toString("base64");
}