"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter, redirect } from "next/navigation";
import { useEffect, ReactNode } from "react";
import UrlUtils from "@/utils/app/UrlUtils";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { PageConfiguration } from "@/modules/pageBlocks/dtos/PageConfiguration";

export default function PageEditClient({ page, id, children }: { page: PageConfiguration; id: string; children: ReactNode }) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (UrlUtils.stripTrailingSlash(pathname) === `/admin/pages/edit/${id}`) {
      router.push(`/admin/pages/edit/${id}/blocks`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <div>
      <EditPageLayout
        title={page.name}
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
