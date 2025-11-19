"use client";

import { useRouter, useParams } from "next/navigation";
import GroupForm from "@/components/core/roles/GroupForm";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import UrlUtils from "@/utils/app/UrlUtils";
import { useAppData } from "@/lib/state/useAppData";
import { GroupWithDetailsDto } from "@/db/models/permissions/GroupsModel";
import { TenantUserWithUserDto } from "@/db/models/accounts/TenantsModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

type LoaderData = {
  title: string;
  item: GroupWithDetailsDto;
  tenantUsers: TenantUserWithUserDto[];
};

interface EditGroupClientProps {
  data: LoaderData;
}

export default function EditGroupClient({ data }: EditGroupClientProps) {
  const appData = useAppData();
  const router = useRouter();
  const params = useParams();

  return (
    <SlideOverWideEmpty
      title="Edit User Group"
      open={true}
      size="2xl"
      onClose={() => router.push(UrlUtils.currentTenantUrl(params, "settings/members"))}
    >
      <GroupForm
        allUsers={data.tenantUsers}
        item={data.item}
        canUpdate={getUserHasPermission(appData, "app.settings.groups.full") || data.item.createdByUserId === appData?.user.id}
        canDelete={getUserHasPermission(appData, "app.settings.groups.full") || data.item.createdByUserId === appData?.user.id}
      />
    </SlideOverWideEmpty>
  );
}
