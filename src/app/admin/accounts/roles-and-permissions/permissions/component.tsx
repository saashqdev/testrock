"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { PermissionsWithRolesDto } from "@/db/models";
import PermissionsTable from "@/components/core/roles/PermissionsTable";
import { useAdminData } from "@/lib/state/useAdminData";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import InputSearchWithURL from "@/components/ui/input/InputSearchWithURL";
import InputFilters from "@/components/ui/input/InputFilters";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import PermissionForm from "@/components/core/roles/PermissionForm";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";

type LoaderData = {
  title: string;
  items: PermissionsWithRolesDto[];
  filterableProperties: FilterablePropertyDto[];
  roles: RoleWithPermissionsDto[];
};

interface PermissionsClientProps {
  data: LoaderData;
}

export default function PermissionsClient({ data }: PermissionsClientProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const modal = searchParams.get('modal');
  const permissionId = searchParams.get('permissionId');
  const isModalOpen = modal === 'new' || (modal === 'edit' && !!permissionId);
  
  const [selectedPermission, setSelectedPermission] = useState<PermissionsWithRolesDto | undefined>();
  
  // Load permission data when editing
  useEffect(() => {
    if (modal === 'edit' && permissionId) {
      const permission = data.items.find(p => p.id === permissionId);
      setSelectedPermission(permission);
    } else {
      setSelectedPermission(undefined);
    }
  }, [modal, permissionId, data.items]);
  
  function closeModal() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('modal');
    params.delete('permissionId');
    router.push(`/admin/accounts/roles-and-permissions/permissions?${params.toString()}`);
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
      <PermissionsTable
        // canReorder={true}
        items={data.items}
        canCreate={getUserHasPermission(adminData, "admin.roles.create")}
        canUpdate={getUserHasPermission(adminData, "admin.roles.update")}
      />

      <SlideOverWideEmpty
        title={permissionId ? t("shared.edit") : t("shared.new")}
        open={isModalOpen}
        onClose={closeModal}
        size="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <PermissionForm 
              item={selectedPermission}
              roles={data.roles} 
              onCancel={closeModal}
            />
          </div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}
