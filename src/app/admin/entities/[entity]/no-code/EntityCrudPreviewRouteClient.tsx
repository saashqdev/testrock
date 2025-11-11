"use client";

import { Entity } from "@prisma/client";
import { useTranslation } from "react-i18next";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";

export function EntityCrudPreviewRouteClient({ item, entitySlug }: { item: Entity; entitySlug: string }) {
  const { t } = useTranslation();
  return (
    <EditPageLayout
      title={`${t(item.title)} - Sample views`}
      menu={[
        { title: t("models.entity.plural"), routePath: "/admin/entities" },
        { title: t(item.title), routePath: `/admin/entities/${entitySlug}/details` },
        { title: "No-code", routePath: `/admin/entities/${entitySlug}/no-code` },
      ]}
      withHome={false}
    >
      <div className="border-border h-[calc(100vh-200px)] overflow-y-auto rounded-lg border-2 border-dashed sm:h-[calc(100vh-160px)]">
        {<></>}
      </div>
    </EditPageLayout>
  );
}
