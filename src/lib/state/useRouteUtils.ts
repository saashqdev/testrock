"use client";

import { usePathname } from "next/navigation";
import UrlUtils from "@/utils/app/UrlUtils";

export default function useRouteUtils() {
  const pathname = usePathname();
  const parentRoute = UrlUtils.getParentRoute(pathname);
  return {
    parentRoute,
  };
}
