"use client";

import { useTranslation } from "react-i18next";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import { useEffect, useRef, useState } from "react";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import { useRouter, usePathname } from "next/navigation";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";
import RowProperties from "@/components/entities/rows/RowProperties";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import InputText, { RefInputText } from "@/components/ui/input/InputText";

interface TenantNewProps {
  tenantSettingsEntity: EntityWithDetailsDto | null;
  onSubmit?: (formData: FormData) => Promise<void>;
  isPending?: boolean;
}

export default function TenantNew({ tenantSettingsEntity, onSubmit, isPending }: TenantNewProps) {
  const [actionData, setActionData] = useState<{ tenantId?: string; error?: string; success?: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const inputName = useRef<RefInputText>(null);
  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  const [name, setName] = useState("");

  useEffect(() => {
    inputName.current?.input.current?.focus();
    inputName.current?.input.current?.select();
  }, []);

  useEffect(() => {
    if (actionData?.error) {
      errorModal.current?.show(actionData.error);
    } else if (actionData?.success) {
      successModal.current?.show(actionData.success);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function createdTenant() {
    if (actionData?.tenantId) {
      const form = new FormData();
      form.set("action", "set-tenant");
      form.set("tenantId", actionData.tenantId);
      form.set("redirectTo", pathname + location.search);
      
      // Using fetch for form submission in Next.js
      fetch("/app", {
        method: "POST",
        body: form,
      }).then(() => {
        router.push("/app" + location.search);
      });
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    
    const formData = new FormData(event.currentTarget);
    formData.set("action", "create");
    
    // If onSubmit prop is provided, use it instead of the default behavior
    if (onSubmit) {
      await onSubmit(formData);
      return;
    }
    
    // Default behavior when no onSubmit prop is provided
    setIsLoading(true);
    
    try {
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });
      
      const result = await response.json();
      
      if (result.error) {
        setActionData({ error: result.error });
      } else if (result.success) {
        setActionData({ success: result.success, tenantId: result.tenantId });
      }
    } catch (error) {
      setActionData({ error: "An unexpected error occurred" });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div>
      <div className="flex flex-1 flex-col justify-between">
        <form onSubmit={handleSubmit} className="">
          <input type="hidden" name="action" value="create" hidden readOnly />
          <div className="space-y-3 pb-5 pt-2">
            <div>
              {/* <label className="block text-xs font-medium text-muted-foreground">
                {t("account.register.organization")} <span className="ml-1 text-red-500">*</span>
              </label> */}

              <div className="shadow-2xs mt-1 -space-y-px rounded-md">
                <div>
                  {/* <label htmlFor="tax-id" className="sr-only">
                    {t("shared.name")}
                  </label> */}
                  <InputText
                    title={t("shared.name")}
                    ref={inputName}
                    type="text"
                    name="name"
                    id="name"
                    placeholder={t("shared.name")}
                    required
                    value={name}
                    setValue={setName}
                    // className="focus:border-theme-500 focus:ring-ring relative block w-full appearance-none rounded-md border border-border px-3 py-2 text-foreground placeholder-gray-500 focus:z-10 focus:outline-hidden sm:text-sm"
                  />
                </div>
              </div>
            </div>

            {tenantSettingsEntity && (
              <div className="col-span-6 sm:col-span-6">
                <RowProperties entity={tenantSettingsEntity} item={null} />
              </div>
            )}
          </div>

          <div className="pb-6 text-right">
            <div className="right-0 text-sm leading-5">
              <span className="shadow-2xs ml-2 inline-flex rounded-sm">
                <LoadingButton type="submit" disabled={isPending !== undefined ? isPending : isLoading}>
                  {(isPending !== undefined ? isPending : isLoading) ? t("shared.loading") : t("shared.create")}
                </LoadingButton>
              </span>
            </div>
          </div>
        </form>
      </div>
      <SuccessModal ref={successModal} onClosed={createdTenant} />
      <ErrorModal ref={errorModal} />
    </div>
  );
}
