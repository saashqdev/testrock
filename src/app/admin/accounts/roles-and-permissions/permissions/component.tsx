"use client";

import { useRouter, useParams } from "next/navigation";
import { PermissionsWithRolesDto } from "@/db/models";
import PermissionsTable from "@/components/core/roles/PermissionsTable";
import { useAdminData } from "@/lib/state/useAdminData";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import InputFilters from "@/components/ui/input/InputFilters";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";

type LoaderData = {
  title: string;
  items: PermissionsWithRolesDto[];
  filterableProperties: FilterablePropertyDto[];
};

interface PermissionsClientProps {
  data: LoaderData;
  children?: ReactNode;
}

export default function PermissionsClient({ data, children }: PermissionsClientProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const router = useRouter();
  const params = useParams();
  
  // Check if we're in a nested route (new or edit)
  const isNestedRoute = !!children;

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="grow">
          <InputSearchWithURL />
        </div>
        <InputFilters filters={data.filterableProperties} />
        <ButtonPrimary to="new">
          <div className="sm:text-sm">+</div>
        </ButtonPrimary>
      </div>
      <PermissionsTable
        // canReorder={true}
        items={data.items}
        canCreate={getUserHasPermission(adminData, "admin.roles.create")}
        canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
      />

      <SlideOverWideEmpty
        title={params.id ? t("shared.edit") : t("shared.new")}
        open={isNestedRoute}
        onClose={() => {
          router.push("/admin/accounts/roles-and-permissions/permissions");
        }}
        className="sm:max-w-lg"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}
