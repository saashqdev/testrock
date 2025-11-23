"use client";

import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import UploadDocuments from "@/components/ui/uploaders/UploadDocument";
import InputText from "@/components/ui/input/InputText";
import UrlUtils from "@/utils/app/UrlUtils";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import RowProperties from "@/components/entities/rows/RowProperties";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { TenantType } from "@prisma/client";
import InputCombobox from "@/components/ui/input/InputCombobox";
import Image from "next/image";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";

interface Props {
  tenant: TenantWithDetailsDto;
  disabled: boolean;
  tenantSettingsEntity: EntityWithDetailsDto | null;
  tenantTypes?: TenantType[];
  options?: {
    canChangeType: boolean;
  };
}

export default function UpdateTenantDetailsForm({ tenant, disabled, tenantSettingsEntity, tenantTypes, options }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const [slug, setSlug] = useState<string | undefined>(tenant?.slug ?? "");
  const [icon, setIcon] = useState<string | undefined>(tenant?.icon ?? "");
  const [types, setTypes] = useState<string[]>(tenant.types.map((f) => f.id));
  const [isSubmitting, setIsSubmitting] = useState(false);

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);

      const response = await fetch(`/api/admin/accounts/${tenant.id}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        successModal.current?.show(data.success || t("shared.success"));
        router.refresh();
      } else {
        errorModal.current?.show(data.error || t("shared.error"));
      }
    } catch (error) {
      errorModal.current?.show(t("shared.error"));
    } finally {
      setIsSubmitting(false);
    }
  }

  function loadedImage(image: string | undefined) {
    setIcon(image);
  }

  return (
    <>
      <form onSubmit={handleSubmit}>
        <input type="hidden" name="action" value="edit" hidden readOnly />
        <div className="p-1">
          <div className="">
            <div className="grid grid-cols-6 gap-2">
              <div className="col-span-6 sm:col-span-6">
                <InputText autoFocus disabled={disabled} required name="name" title={t("shared.name")} defaultValue={tenant?.name} />
              </div>
              <div className="col-span-6 sm:col-span-6">
                <InputText
                  disabled={disabled}
                  required
                  name="slug"
                  title={t("shared.slug")}
                  value={slug}
                  setValue={(e) => {
                    const slug = UrlUtils.slugify(e.toString());
                    if (slug) {
                      setSlug(slug);
                    }
                  }}
                />
              </div>
              {tenantTypes !== undefined && tenantTypes.length > 0 && (
                <div className="col-span-6 sm:col-span-6">
                  {types?.map((item, idx) => {
                    return <input key={idx} type="hidden" name={`typeIds[]`} value={item} hidden readOnly />;
                  })}
                  <InputCombobox
                    withSearch={false}
                    disabled={!options?.canChangeType}
                    name="typeIds"
                    title={t("shared.type")}
                    value={types}
                    onChange={(e) => setTypes(e as string[])}
                    options={tenantTypes.map((f) => {
                      return {
                        value: f.id,
                        name: f.title,
                      };
                    })}
                  />
                </div>
              )}
              <div className="col-span-6 sm:col-span-6">
                <label htmlFor="icon" className="block text-xs font-medium leading-5 text-foreground/80">
                  {t("shared.icon")}
                </label>
                <div className="mt-2 flex items-center space-x-3">
                  <input id="icon" name="icon" value={icon} hidden readOnly />
                  <div className="h-12 w-12 overflow-hidden rounded-md bg-secondary/90">
                    {(() => {
                      if (icon) {
                        return <Image id="icon" alt="Tenant icon" src={icon} />;
                      } else {
                        return (
                          <svg id="icon" className="h-full w-full text-gray-300" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        );
                      }
                    })()}
                  </div>

                  {icon ? (
                    <ButtonTertiary disabled={disabled} destructive={true} onClick={() => loadedImage("")} type="button">
                      {t("shared.delete")}
                    </ButtonTertiary>
                  ) : (
                    <UploadDocuments disabled={disabled} accept="image/png, image/jpg, image/jpeg" onDropped={loadedImage} />
                  )}
                </div>
              </div>

              {tenantSettingsEntity && (
                <div className="col-span-6 sm:col-span-6">
                  <RowProperties entity={tenantSettingsEntity} item={tenant.tenantSettingsRow?.row ?? null} />
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 border-t border-border pt-3">
            <div className="flex justify-end">
              <LoadingButton disabled={disabled || isSubmitting} type="submit">
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        </div>
      </form>

      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </>
  );
}
