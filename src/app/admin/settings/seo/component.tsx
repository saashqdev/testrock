"use client";

import { getServerTranslations } from "@/i18n/server";
import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import BackButtonWithTitle from "@/components/ui/buttons/BackButtonWithTitle";
import { useTranslation } from "react-i18next";

interface ComponentProps {
  data: any;
}

export default function Component({ data }: ComponentProps) {
  const { t } = useTranslation();
  
  return (
    <EditPageLayout title={<BackButtonWithTitle href="/admin/settings">{t("pages.seo")}</BackButtonWithTitle>}>
      <PageMetaTagsRouteIndex data={data} />
    </EditPageLayout>
  );
}
