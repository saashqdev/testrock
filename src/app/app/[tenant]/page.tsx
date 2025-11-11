"use client";

import { useEffect } from "react";
import { useRouter, usePathname, useParams } from "next/navigation";
import { useAppData } from "@/lib/state/useAppData";
import { useRootData } from "@/lib/state/useRootData";
import UrlUtils from "@/utils/app/UrlUtils";

export default function AppTenantPage() {
  const appData = useAppData();
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const { appConfiguration } = useRootData();

  useEffect(() => {
    if (!appData.currentTenant) {
      router.push("/app");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appData.currentTenant]);

  useEffect(() => {
    if (!UrlUtils.stripTrailingSlash(pathname).startsWith(`/app/${params.tenant}/settings`)) {
      if (appConfiguration.subscription.required && appData.mySubscription?.products.length === 0) {
        router.push(`/subscribe/${params.tenant}?error=subscription_required`);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
