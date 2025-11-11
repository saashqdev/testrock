"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, ReactNode, use } from "react";
import UrlUtils from "@/utils/app/UrlUtils";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";

// Client Component for interactive functionality
export default function PageEditLayout({ 
  children, 
  params 
}: { 
  children: ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(pathname) === `/admin/pages/edit/${id}`) {
      router.push(`/admin/pages/edit/${id}/blocks`);
    }
  }, [pathname, id, router]);

  return (
    <div>
      <EditPageLayout
        title={t("pages.title")}
        tabs={[
          {
            name: t("pages.blocks"),
            routePath: `/admin/pages/edit/${id}/blocks`,
          },
          {
            name: t("pages.seo"),
            routePath: `/admin/pages/edit/${id}/seo`,
          },
          {
            name: t("pages.settings"),
            routePath: `/admin/pages/edit/${id}/settings`,
          },
        ]}
        withHome={false}
      >
        {children}
      </EditPageLayout>
    </div>
  );
}
