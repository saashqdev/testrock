"use client";

import { useRouter, useParams } from "next/navigation";
import ApiKeyForm from "@/components/core/apiKeys/ApiKeyForm";
import OpenModal from "@/components/ui/modals/OpenModal";
import UrlUtils from "@/utils/app/UrlUtils";
import { useAppData } from "@/lib/state/useAppData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";

type ComponentProps = {
  data: {
    item: ApiKeyWithDetailsDto;
  };
};

export default function Component({ data }: ComponentProps) {
  const router = useRouter();
  const appData = useAppData();
  const params = useParams();

  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => router.push(UrlUtils.currentTenantUrl(params, "settings/api/keys"))}>
        <ApiKeyForm
          entities={appData.entities}
          item={data.item}
          canUpdate={getUserHasPermission(appData, "app.settings.apiKeys.update")}
          canDelete={getUserHasPermission(appData, "app.settings.apiKeys.delete")}
        />
      </OpenModal>
    </>
  );
}
