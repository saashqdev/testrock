"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import UrlUtils from "@/utils/app/UrlUtils";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";

export default function RolesAndPermissionsLayout({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(pathname) === "/admin/accounts/roles-and-permissions") {
      router.push("/admin/accounts/roles-and-permissions/roles");
    }
  }, [pathname, router]);

  return (
    <EditPageLayout
      tabs={[
        {
          name: t("models.role.plural"),
          routePath: "/admin/accounts/roles-and-permissions/roles",
        },
        {
          name: t("models.permission.plural"),
          routePath: "/admin/accounts/roles-and-permissions/permissions",
        },
        {
          name: t("models.role.adminRoles"),
          routePath: "/admin/accounts/roles-and-permissions/admin-users",
        },
        {
          name: t("models.role.userRoles"),
          routePath: "/admin/accounts/roles-and-permissions/account-users",
        },
        {
          name: "Seed",
          routePath: "/admin/accounts/roles-and-permissions/seed",
        },
      ]}
    >
      {children}
    </EditPageLayout>
  );
}
