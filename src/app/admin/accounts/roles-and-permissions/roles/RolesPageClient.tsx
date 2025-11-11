"use client";

import { useTranslation } from "react-i18next";
import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import RolesTable from "@/components/core/roles/RolesTable";

interface RolesPageClientProps {
  items: RoleWithPermissionsAndUsersDto[];
  filterableProperties: FilterablePropertyDto[];
  paramId: string | undefined;
}

export default function RolesPageClient({ items, filterableProperties, paramId }: RolesPageClientProps) {
  const { t } = useTranslation();

  return (
    <EditPageLayout
      title={t("models.role.plural")}
      buttons={
        <>
          <InputFilters filters={filterableProperties} />
        </>
      }
    >
      <RolesTable items={items} canUpdate={true} tenantId={null} />
    </EditPageLayout>
  );
}
