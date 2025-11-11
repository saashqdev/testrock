"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useRootData } from "@/lib/state/useRootData";
import CookieHelper from "@/lib/helpers/CookieHelper";
import { CookieCategory } from "@/lib/cookies/CookieCategory";

const FORCE_IN_ROUTES = ["/app", "/admin", "/crisp"];
const START_HIDDEN_IN_ROUTES = ["/admin", "/app"];

export default function ScriptCrisp() {
  const rootData = useRootData();
  const pathname = usePathname();

  useEffect(() => {
    let hasConsent = CookieHelper.hasConsent(rootData.userSession, CookieCategory.FUNCTIONAL) || FORCE_IN_ROUTES.some((p) => pathname.startsWith(p));
    if (rootData.chatWebsiteId && hasConsent && !window.$crisp) {
      window.$crisp = [];
      window.CRISP_WEBSITE_ID = rootData.chatWebsiteId;
      const d = document;
      const s = d.createElement("script");
      s.src = "https://client.crisp.chat/l.js";
      s.async = true;
      d.getElementsByTagName("head")[0].appendChild(s);
    }
    if (window.$crisp && START_HIDDEN_IN_ROUTES.some((p) => pathname.startsWith(p))) {
      try {
        // @ts-ignore
        window.$crisp.push(["do", "chat:hide"]);
      } catch {
        // ignore
      }
    }
  }, [rootData.userSession?.cookies, rootData.chatWebsiteId, pathname]);

  return null;
}

declare global {
  interface Window {
    $crisp: any;
    CRISP_WEBSITE_ID: string;
  }
}
