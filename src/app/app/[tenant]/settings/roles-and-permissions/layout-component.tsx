"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import TabsVertical from "@/components/ui/tabs/TabsVertical";
import { useTranslation } from "react-i18next";
import UrlUtils from "@/utils/app/UrlUtils";

interface RolesAndPermissionsLayoutProps {
  children: React.ReactNode;
  params: { tenant: string };
}

export default function RolesAndPermissionsLayout({ children, params }: RolesAndPermissionsLayoutProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(pathname) === UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions")) {
      router.push(UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div className="mx-auto max-w-5xl space-y-2 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
        <div className="lg:col-span-2">
          <TabsVertical
            tabs={[
              {
                name: t("models.user.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/users"),
              },
              {
                name: t("models.role.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/roles"),
              },
              {
                name: t("models.permission.plural"),
                routePath: UrlUtils.currentTenantUrl(params, "settings/roles-and-permissions/permissions"),
              },
            ]}
          />
        </div>
        <div className="lg:col-span-10">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
