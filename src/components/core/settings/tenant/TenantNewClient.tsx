"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import TenantNew from "./TenantNew";
import { useState, useTransition } from "react";

interface TenantNewClientProps {
  tenantSettingsEntity: EntityWithDetailsDto | null;
  createTenantAction: (formData: FormData) => Promise<{ error?: string } | undefined>;
}

export default function TenantNewClient({ tenantSettingsEntity, createTenantAction }: TenantNewClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [error, setError] = useState<string | undefined>();
  const [isPending, startTransition] = useTransition();

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await createTenantAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <>
      <div className="text-center">
        <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">{t("app.tenants.create.title")}</h1>
        <p className="mt-4 text-lg leading-6 text-muted-foreground">{t("app.tenants.create.headline")}</p>
      </div>
      <div className="mt-12">
        <TenantNew tenantSettingsEntity={tenantSettingsEntity} onSubmit={handleSubmit} isPending={isPending} />
        <div id="form-error-message">
          {error && !isPending ? (
            <p className="py-2 text-xs text-rose-500" role="alert">
              {error}
            </p>
          ) : null}
        </div>

        <div className="mt-4 flex">
          <button type="button" onClick={() => router.back()} className="w-full text-center text-sm font-medium text-primary hover:text-primary/90">
            <span aria-hidden="true"> &larr;</span> Go back
          </button>
        </div>
      </div>
    </>
  );
}
