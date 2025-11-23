"use client";

import { useRouter, useParams, useSearchParams } from "next/navigation";
import RolesTable from "@/components/core/roles/RolesTable";
import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import { useAdminData } from "@/lib/state/useAdminData";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import InputFilters from "@/components/ui/input/InputFilters";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { useTranslation } from "react-i18next";
import { ReactNode } from "react";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsersDto[];
  filterableProperties: FilterablePropertyDto[];
};

interface RolesClientProps {
  data: LoaderData;
  children?: ReactNode;
}

export default function RolesClient({ data, children }: RolesClientProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

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
      {/* <InputSearchWithURL onNewRoute={getUserHasPermission(adminData, "admin.roles.create") ? "new" : undefined} /> */}
      <RolesTable items={data.items} canUpdate={getUserHasPermission(adminData, "admin.roles.update")} />

      <SlideOverWideEmpty
        title={params.id ? "Edit Role" : "New Role"}
        open={!!params.id || !!params.new}
        onClose={() => {
          router.replace(".");
        }}
        size="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}
