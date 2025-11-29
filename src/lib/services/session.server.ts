"use server";

import { randomBytes } from "crypto";
import { db } from "@/db";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { parse, serialize } from "cookie";
import jwt, { JwtPayload } from "jsonwebtoken";
import { defaultThemeColor, defaultThemeScheme } from "@/lib/themes";

export type UserSession = {
  userId: string;
  lightOrDarkMode: string;
  lng: string;
  crsf?: string;
  cookies: { category: string; allowed: boolean }[];
  metrics?: {
    enabled: boolean;
    logToConsole: boolean;
    saveToDatabase: boolean;
    ignoreUrls: string[];
  };
  impersonatingFromUserId?: string;
  theme?: string;
  scheme: string;
};

const SESSION_COOKIE_NAME = "RSN_session";
const SESSION_SECRET = process.env.SESSION_SECRET || "";

if (!SESSION_SECRET) {
  throw new Error("SESSION_SECRET must be set");
}

export async function setLoggedUser(user: { id: string; email: string; defaultTenantId: string | null }) {
  const userTenants = await db.tenant.getTenantUsers(user.id);

  let currentTenantId = "";

  if (user.defaultTenantId) {
    const tenant = await db.tenant.getTenant(user.defaultTenantId);
    if (tenant) {
      return {
        userId: user.id,
        defaultTenantId: tenant.id,
      };
    }
  }

  if (userTenants.length > 0) {
    const tenant = userTenants[0];
    currentTenantId = tenant.id;
  }

  return {
    userId: user.id,
    defaultTenantId: currentTenantId,
  };
}

export async function storage() {
  (await cookies()).set("RJ_session", SESSION_SECRET, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });
}

export async function getUserSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionCookie) return null;

  try {
    const decoded = jwt.verify(sessionCookie, SESSION_SECRET) as JwtPayload;
    const userSession: UserSession = {
      userId: decoded.userId as string,
      lightOrDarkMode: (decoded.scheme as string) ?? defaultThemeScheme,
      lng: (decoded.lng as string) ?? "en",
      cookies: (decoded.cookies as { category: string; allowed: boolean }[]) ?? [],
      scheme: (decoded.scheme as string) ?? defaultThemeScheme,
      theme: (decoded.theme as string) ?? defaultThemeColor,
    };
    return userSession;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[session] error: " + e.message);
    return null;
  }
}

export async function getUserInfo(): Promise<UserSession> {
  const session = await getUserSession();

  const userId = session?.userId ?? "";
  const scheme = session?.scheme || defaultThemeScheme;
  const lightOrDarkMode = scheme; // Keep in sync with scheme
  const lng = "en"; // Default language, adjust if needed
  const crsf = undefined; // Not present in UserSessionDto
  
  // Fetch metrics configuration from database
  let metrics: { enabled: boolean; logToConsole: boolean; saveToDatabase: boolean; ignoreUrls: string[] } = { 
    enabled: false, 
    logToConsole: false, 
    saveToDatabase: false, 
    ignoreUrls: [] 
  };
  try {
    const appConfiguration = await db.appConfiguration.getAppConfiguration();
    metrics = appConfiguration.metrics;
  } catch (error) {
    // Use default metrics if configuration cannot be loaded
    console.warn("Could not load metrics configuration, using defaults", error);
  }
  
  const cookies: { category: string; allowed: boolean }[] = []; // Default cookies
  const impersonatingFromUserId = undefined; // Not present in UserSessionDto
  const theme = session?.theme ?? defaultThemeColor;

  return {
    userId,
    lightOrDarkMode,
    lng,
    crsf,
    metrics,
    cookies,
    impersonatingFromUserId,
    theme,
    scheme,
  };
}

export async function resetUserSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, "", {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: -1, // This deletes the cookie
    httpOnly: true,
  });
}

export async function requireUserId(request: Request, redirectTo: string = new URL(request.url).pathname) {
  const session = await getUserSession();
  const userId = session?.userId;
  if (!userId || typeof userId !== "string") {
    const searchParams = new URLSearchParams([["redirectTo", redirectTo]]);
    throw redirect(`/login?${searchParams}`);
  }
  return userId;
}

export async function requireUser({ request }: { request: Request }) {
  const userId = await requireUserId(request);
  const user = await db.users.getUser(userId);
  if (!user) {
    throw redirect("/login");
  }
  return user;
}

export async function logout() {
  await resetUserSession();
  redirect("/login");
}

export async function createUserSession(userSession: UserSession, redirectTo: string = "") {
  const cookieStore = await cookies();
  const token = jwt.sign(userSession, SESSION_SECRET, { expiresIn: "30d" });
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
  });
  cookieStore.set("userId", userSession.userId ?? "");
  cookieStore.set("lightOrDarkMode", userSession.scheme ?? userSession.lightOrDarkMode);
  cookieStore.set("lng", userSession.lng);
  cookieStore.set("crsf", userSession.crsf ?? "");
  cookieStore.set("metrics", JSON.stringify(userSession.metrics ?? {}));
  cookieStore.set("cookies", JSON.stringify(userSession.cookies));
  cookieStore.set("impersonatingFromUserId", userSession.impersonatingFromUserId ?? "");
  cookieStore.set("theme", userSession.theme ?? "");
  redirect(redirectTo);
}

export async function commitSession(session: UserSession) {
  return await sessionStorage.commitSession(session);
}

export async function generateCSRFToken() {
  const cookieStore = await cookies();

  // Check if CSRF token already exists
  const existingToken = cookieStore.get("csrf")?.value;
  if (existingToken) {
    return existingToken;
  }

  // Generate new token
  const token = randomBytes(100).toString("base64");

  // Set the CSRF token as a cookie (only works in Server Actions/Route Handlers)
  try {
    cookieStore.set("csrf", token, {
      httpOnly: false, // Must be accessible to JavaScript for form submission
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  } catch (e) {
    // If we can't set the cookie (e.g., in Server Component), return the existing or empty string
    // The cookie will be set on first Server Action call
    console.warn("Could not set CSRF cookie in this context");
  }

  return token;
}

export async function getCSRFToken() {
  const cookieStore = await cookies();
  return cookieStore.get("csrf")?.value || "";
}

export async function validateCSRFToken(request: Request) {
  // first we parse the body, be sure to clone the request so you can parse the body again in the future
  let body = Object.fromEntries(new URLSearchParams(await request.clone().text()).entries()) as { csrf?: string };
  // then we throw an error if one of our validations didn't pass
  if (!(await cookies()).has("csrf")) throw new Error("CSRF Session Token not included.");
  if (!body.csrf) throw new Error("CSRF Request Token not included.");
  if (body.csrf !== (await cookies()).get("csrf")?.value) throw new Error("CSRF tokens do not match, try refreshing the page.");
  // we don't need to return anything, if the validation fail it will throw an error
}
