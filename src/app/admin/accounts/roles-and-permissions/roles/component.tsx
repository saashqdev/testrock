"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RolesTable from "@/components/core/roles/RolesTable";
import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import { useAdminData } from "@/lib/state/useAdminData";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import InputFilters from "@/components/ui/input/InputFilters";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import RoleForm from "@/components/core/roles/RoleForm";
import { PermissionsWithRolesDto } from "@/db/models";

type LoaderData = {
  title: string;
  items: RoleWithPermissionsAndUsersDto[];
  filterableProperties: FilterablePropertyDto[];
  permissions: PermissionsWithRolesDto[];
};

interface RolesClientProps {
  data: LoaderData;
}

export default function RolesClient({ data }: RolesClientProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const modal = searchParams.get('modal');
  const roleId = searchParams.get('roleId');
  const isModalOpen = modal === 'new' || (modal === 'edit' && !!roleId);
  
  const [selectedRole, setSelectedRole] = useState<RoleWithPermissionsAndUsersDto | undefined>();
  
  // Load role data when editing
  useEffect(() => {
    if (modal === 'edit' && roleId) {
      const role = data.items.find(r => r.id === roleId);
      setSelectedRole(role);
    } else {
      setSelectedRole(undefined);
    }
  }, [modal, roleId, data.items]);
  
  function closeModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modal');
    params.delete('roleId');
    router.push(`/admin/accounts/roles-and-permissions/roles?${params.toString()}`);
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <div className="flex space-x-2">
        <div className="grow">
          <InputSearchWithURL />
        </div>
        <InputFilters filters={data.filterableProperties} />
        <ButtonPrimary to="?modal=new">
          <div className="sm:text-sm">+</div>
        </ButtonPrimary>
      </div>
      {/* <InputSearchWithURL onNewRoute={getUserHasPermission(adminData, "admin.roles.create") ? "new" : undefined} /> */}
      <RolesTable items={data.items} canUpdate={getUserHasPermission(adminData, "admin.roles.update")} />

      <SlideOverWideEmpty
        title={roleId ? t("shared.edit") : t("shared.new")}
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <RoleForm 
              item={selectedRole}
              permissions={data.permissions} 
              onCancel={closeModal}
            />
          </div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}
