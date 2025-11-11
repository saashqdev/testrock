"use client";

import { useTranslation } from "react-i18next";
import ApiKeysTable from "@/components/core/apiKeys/ApiKeysTable";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { useAdminData } from "@/lib/state/useAdminData";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type ComponentProps = {
  data: {
    apiKeys: ApiKeyWithDetailsDto[];
  };
  children?: React.ReactNode;
};

export default function Component({ data, children }: ComponentProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();

  return (
    <EditPageLayout title={t("models.apiKey.plural")}>
      <ApiKeysTable
        canCreate={getUserHasPermission(adminData, "admin.apiKeys.create")}
        entities={adminData?.entities ?? []}
        items={data.apiKeys}
        withTenant={true}
      />
      {children}
    </EditPageLayout>
  );
}
