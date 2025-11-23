"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import EntityViewForm from "@/components/entities/views/EntityViewForm";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import InputGroup from "@/components/ui/forms/InputGroup";
import InputRadioGroupCards from "@/components/ui/input/InputRadioGroupCards";
import InputSelector from "@/components/ui/input/InputSelector";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import { UserWithNamesDto } from "@/db/models/accounts/UsersModel";

type LoaderData = {
  allTenants: TenantWithDetailsDto[];
  allUsers: UserWithNamesDto[];
  entity: EntityWithDetailsDto;
};

interface NewEntityViewClientProps {
  data: LoaderData;
}

export default function NewEntityViewClient({ data }: NewEntityViewClientProps) {
  const { t } = useTranslation();
  const router = useRouter();

  const errorModal = useRef<RefErrorModal>(null);

  const searchParams = useSearchParams();
  const newSearchParams = new URLSearchParams(searchParams?.toString() || "");

  const [error, setError] = useState<string>();

  const [type, setType] = useState<"default" | "tenant" | "user" | "system">("default");
  const [tenantId, setTenantId] = useState<string>();
  const [userId, setUserId] = useState<string>();

  const [viewType, setViewType] = useState<{
    tenantId: string | null;
    userId: string | null;
    isSystem: boolean;
  }>();

  useEffect(() => {
    const type = newSearchParams.get("type");
    if (type && ["default", "tenant", "user", "system"].includes(type)) {
      setType(type as any);
    }
  }, [newSearchParams]);

  useEffect(() => {
    setUserId(undefined);
  }, [tenantId]);

  useEffect(() => {
    setTenantId(undefined);
    setUserId(undefined);
  }, [type]);

  function getUsers() {
    const tenant = data.allTenants?.find((f) => f.id === tenantId);
    if (!tenant) {
      return data.allUsers ?? [];
    }
    return tenant?.users.map((f) => f.user) ?? [];
  }

  function getError() {
    let error: string | undefined = undefined;
    if (!type) {
      error = "Select a type";
    } else if (type === "tenant" && !tenantId) {
      error = "Select an account";
    } else if (type === "user" && (!userId || !tenantId)) {
      error = "Select an account and a user";
    } else if (type === "system" && (userId || tenantId)) {
      error = "System views can't be associated to a user or account";
    }
    return error;
  }

  function onAccept() {
    const error = getError();
    setError(error);

    if (!error) {
      setViewType({
        tenantId: tenantId ?? null,
        userId: userId ?? null,
        isSystem: type === "system",
      });
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    onAccept();
  }

  return (
    <div>
      {!viewType ? (
        <form onSubmit={handleSubmit} className="space-y-3">
          <InputGroup title={t("models.view.type")}>
            <div className="space-y-1">
              <InputRadioGroupCards
                display="name"
                name="type"
                value={type}
                onChange={(e) => setType((e?.toString() ?? "default") as any)}
                columns={2}
                options={[
                  { name: "Default (all accounts)", value: "default" },
                  { name: "Account", value: "tenant" },
                  { name: "User", value: "user" },
                  { name: "System", value: "system" },
                ]}
              />
            </div>
          </InputGroup>

          {type && ["tenant", "user"].includes(type) && (
            <InputGroup title="Applies to">
              <div className="grid gap-2">
                <InputSelector
                  withSearch={false}
                  name="tenantId"
                  title={t("models.view.tenant")}
                  value={tenantId}
                  setValue={(e) => setTenantId(e?.toString())}
                  hint={
                    <>
                      {tenantId !== undefined && (
                        <button type="button" onClick={() => setTenantId(undefined)} className="text-xs text-muted-foreground">
                          {t("shared.clear")}
                        </button>
                      )}
                    </>
                  }
                  options={(data.allTenants ?? []).map((f) => {
                    return {
                      value: f.id,
                      name: f.name + " (" + f.slug + ")",
                    };
                  })}
                />
                {type === "user" && (
                  <InputSelector
                    withSearch={false}
                    title={t("models.view.user")}
                    disabled={!tenantId}
                    value={userId}
                    setValue={(e) => setUserId(e?.toString())}
                    options={getUsers().map((f) => {
                      return {
                        value: f.id,
                        name: f.email,
                      };
                    })}
                    hint={
                      <>
                        {userId !== undefined && (
                          <button type="button" onClick={() => setUserId(undefined)} className="text-xs text-muted-foreground">
                            {t("shared.clear")}
                          </button>
                        )}
                      </>
                    }
                  />
                )}
              </div>
            </InputGroup>
          )}

          <div className="flex justify-between space-x-2">
            <div></div>
            <ButtonPrimary disabled={!!getError()} type="submit">
              {t("shared.next")}
            </ButtonPrimary>
          </div>

          {error && <ErrorBanner title={t("shared.error")} text={error} />}
        </form>
      ) : (
        <EntityViewForm
          entity={data.entity}
          tenantId={viewType.tenantId}
          userId={viewType.userId}
          isSystem={viewType.isSystem}
          onClose={() => router.push(`/admin/entities/views`)}
          showViewType={true}
        />
      )}

      <ErrorModal ref={errorModal} />
    </div>
  );
}
