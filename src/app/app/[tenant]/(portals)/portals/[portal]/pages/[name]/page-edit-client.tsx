"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useActionState } from "react";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { Portal, PortalPage } from "@prisma/client";
import { PortalPageConfigDto } from "@/db/models/core/AppPortalConfigurationModel";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import JsonPropertyValuesInput from "@/modules/jsonProperties/components/JsonPropertyValuesInput";
import UrlUtils from "@/utils/app/UrlUtils";

type PageEditClientProps = {
  data: {
    portal: Portal;
    pageConfig: PortalPageConfigDto;
    page: PortalPage | null;
    portalUrl: string;
  };
  params: any;
  submitAction: (prevState: any, formData: FormData) => Promise<{ error?: string; success?: string }>;
};

export default function PageEditClient({ data, params, submitAction }: PageEditClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const confirmDelete = useRef<RefConfirmModal>(null);
  const [state, formAction] = useActionState(submitAction, { error: undefined, success: undefined });
  
  const [attributes] = useState<JsonPropertiesValuesDto>((data.page?.attributes ?? {}) as JsonPropertiesValuesDto);

  useEffect(() => {
    if (state?.error) {
      toast.error(state.error);
    }
    if (state?.success) {
      toast.success(state.success, {
        action: {
          label: t("shared.preview"),
          onClick: () => {
            const href = `${data.portalUrl}${data.pageConfig.slug}`;
            window.open(href, "_blank");
          },
        },
      });
    }
  }, [state, data.portalUrl, data.pageConfig.slug, t]);

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  async function onDeleteConfirm() {
    const form = new FormData();
    form.set("action", "delete");
    
    const result = await submitAction(null, form);
    
    if (result?.error) {
      toast.error(result.error);
    } else if (result?.success) {
      toast.success(result.success);
      router.push(UrlUtils.getModulePath(params, `portals/${params.portal}/pages`));
    }
  }

  return (
    <div>
      <div>
        <form action={formAction} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
          <input type="hidden" name="action" value="edit" hidden readOnly />

          <div className="space-y-2">
            <JsonPropertyValuesInput prefix="attributes" properties={data.pageConfig.properties} attributes={attributes} />
          </div>
          
          <div className="mt-5 flex justify-between space-x-2">
            <div>
              {data.page && (
                <ButtonSecondary onClick={onDelete} destructive>
                  {t("shared.reset")}
                </ButtonSecondary>
              )}
            </div>
            <div className="flex justify-between space-x-2">
              <ButtonSecondary type="button" className="w-full" onClick={() => router.push(UrlUtils.getModulePath(params, `portals/${params.portal}/pages`))}>
                <div className="w-full text-center">{t("shared.back")}</div>
              </ButtonSecondary>
              <LoadingButton type="submit" className="w-full">
                {t("shared.save")}
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
    </div>
  );
}
