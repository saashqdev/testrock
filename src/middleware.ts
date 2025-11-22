import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Generate a random token using Web Crypto API (Edge Runtime compatible)
function generateCSRFToken(): string {
  const array = new Uint8Array(100);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-url", request.url);
  requestHeaders.set("x-pathname", request.nextUrl.pathname);
  let tenantSlug = "";
  // grab tenant param like /app/:tenant/ or /app/:tenant o /app/:tenant/dashboard or /app/:tenant/... etc
  const tenantMatch = request.url.match(/\/app\/([^/]+)/);
  if (tenantMatch) {
    tenantSlug = tenantMatch[1];
  }
  requestHeaders.set("x-tenant-slug", tenantSlug);

  const response = NextResponse.next({ request: { headers: requestHeaders } });
  
  // Set CSRF token cookie if it doesn't exist
  if (!request.cookies.get("csrf")) {
    const token = generateCSRFToken();
    response.cookies.set("csrf", token, {
      httpOnly: false, // Must be accessible to JavaScript for form submission
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
  }

  return response;
}
