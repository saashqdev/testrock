"use client";

import { Tenant } from "@prisma/client";
import { useRouter } from "next/navigation";
import ApiKeyForm from "@/components/core/apiKeys/ApiKeyForm";
import OpenModal from "@/components/ui/modals/OpenModal";
import { useAdminData } from "@/lib/state/useAdminData";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type AdminApiEditKeyClientProps = {
  tenants: Tenant[];
  item: ApiKeyWithDetailsDto;
};

export default function AdminApiEditKeyClient({ tenants, item }: AdminApiEditKeyClientProps) {
  const router = useRouter();
  const adminData = useAdminData();

  if (!adminData) {
    return null;
  }

  const handleSubmit = async (formData: FormData) => {
    const response = await fetch(`/api/admin/api-keys/${item.id}`, {
      method: "POST",
      body: formData,
    });

    if (response.redirected) {
      router.push(response.url);
    } else if (!response.ok) {
      const data = await response.json();
      console.error(data.error);
    }
  };

  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => router.push(`/admin/api/keys`)}>
        <ApiKeyForm
          entities={adminData.entities}
          tenants={tenants}
          item={item}
          canUpdate={getUserHasPermission(adminData, "admin.apiKeys.update")}
          canDelete={getUserHasPermission(adminData, "admin.apiKeys.delete")}
          action={handleSubmit}
        />
      </OpenModal>
    </>
  );
}
