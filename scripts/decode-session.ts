import jwt from "jsonwebtoken";

const SESSION_SECRET = process.env.SESSION_SECRET || "";

if (!SESSION_SECRET) {
  console.error("❌ SESSION_SECRET not set");
  process.exit(1);
}

// You need to paste your RSN_session cookie value here
const sessionCookie = process.argv[2];

if (!sessionCookie) {
  console.log("Usage: npx tsx scripts/decode-session.ts <RSN_session_cookie_value>");
  console.log("\nTo get your session cookie:");
  console.log("1. Open http://localhost:3000 in your browser");
  console.log("2. Open DevTools (F12)");
  console.log("3. Go to Application tab → Cookies → http://localhost:3000");
  console.log("4. Copy the value of RSN_session cookie");
  console.log("5. Run: npx tsx scripts/decode-session.ts \"<paste_cookie_value_here>\"");
  process.exit(0);
}

try {
  const decoded = jwt.verify(sessionCookie, SESSION_SECRET);
  console.log("📋 Decoded session:");
  console.log(JSON.stringify(decoded, null, 2));
} catch (error: any) {
  console.error("❌ Error decoding session:", error.message);
  process.exit(1);
}
