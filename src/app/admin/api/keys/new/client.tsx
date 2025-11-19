"use client";

import { Tenant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useActionState } from "react";
import ApiKeyCreatedModal from "@/components/core/apiKeys/ApiKeyCreatedModal";
import ApiKeyForm from "@/components/core/apiKeys/ApiKeyForm";
import OpenModal from "@/components/ui/modals/OpenModal";
import { useAdminData } from "@/lib/state/useAdminData";
import { createApiKey } from "./actions";

type ActionData = {
  error?: string;
  apiKey?: {
    key: string;
    alias: string;
  };
};

interface AdminApiNewKeyClientProps {
  tenants: Tenant[];
}

export default function AdminApiNewKeyClient({ tenants }: AdminApiNewKeyClientProps) {
  const router = useRouter();
  const adminData = useAdminData();
  const [state, formAction] = useActionState<ActionData | null, FormData>(createApiKey, null);

  return (
    <>
      <OpenModal className="sm:max-w-xl" onClose={() => router.push(`/admin/api/keys`)}>
        <ApiKeyForm entities={adminData?.entities ?? []} tenants={tenants} action={formAction} error={state?.error} />
        {state?.apiKey !== undefined && <ApiKeyCreatedModal apiKey={state.apiKey} redirectTo="/admin/api/keys" />}
      </OpenModal>
    </>
  );
}
