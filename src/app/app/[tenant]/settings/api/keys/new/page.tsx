"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import ApiKeyCreatedModal from "@/components/core/apiKeys/ApiKeyCreatedModal";
import ApiKeyForm from "@/components/core/apiKeys/ApiKeyForm";
import OpenModal from "@/components/ui/modals/OpenModal";
import UrlUtils from "@/utils/app/UrlUtils";
import { useAppData } from "@/lib/state/useAppData";
import { createApiKey } from "./actions";

type ActionData = {
  error?: string;
  apiKey?: {
    key: string;
    alias: string;
  };
};

export default function ApiNewKeyRoute() {
  const router = useRouter();
  const params = useParams();
  const appData = useAppData();
  const [actionData, setActionData] = useState<ActionData | null>(null);

  const handleFormAction = async (formData: FormData) => {
    const result = await createApiKey(params, formData);
    if (result) {
      setActionData(result);
    }
  };

  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => router.push(UrlUtils.currentTenantUrl(params, "settings/api/keys"))}>
        <ApiKeyForm entities={appData?.entities || []} onSubmit={handleFormAction} />
        {actionData?.apiKey !== undefined && (
          <ApiKeyCreatedModal apiKey={actionData?.apiKey} redirectTo={UrlUtils.currentTenantUrl(params, "settings/api/keys")} />
        )}
      </OpenModal>
    </>
  );
}
