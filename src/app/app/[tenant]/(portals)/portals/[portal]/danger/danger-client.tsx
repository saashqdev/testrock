"use client";

import { useRouter, useParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-hot-toast";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SettingSection from "@/components/ui/sections/SettingSection";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import UrlUtils from "@/utils/app/UrlUtils";
import InputText from "@/components/ui/input/InputText";

type LoaderData = {
  item: PortalWithDetailsDto & { portalUrl?: string };
};

export default function DangerClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const confirmDelete = useRef<RefConfirmModal>(null);
  const [typeToConfirm, setTypeToConfirm] = useState<string>("");

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  async function onDeleteConfirm() {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/portals/${params.portal}/delete`, {
          method: "POST",
        });
        
        const result = await response.json();
        
        if (result.error) {
          toast.error(result.error);
        } else {
          toast.success(t("shared.deleted"));
          router.push(UrlUtils.getModulePath(params, "portals"));
          router.refresh();
        }
      } catch (error) {
        toast.error(t("shared.error"));
      }
    });
  }

  const textToType = `${t("shared.delete")} ${data.item.subdomain}`;
  
  return (
    <EditPageLayout
      title={t("shared.danger")}
      withHome={false}
      menu={[
        {
          title: data.item.title,
          routePath: UrlUtils.getModulePath(params, `portals/${data.item.subdomain}`),
        },
        {
          title: t("shared.danger"),
        },
      ]}
    >
      <div className="pb-10">
        <SettingSection title={t("shared.dangerZone")} description={t("shared.warningCannotUndo")}>
          <div className="mt-12 space-y-2 md:col-span-2 md:mt-0">
            <div>
              <InputText title={`Type "${textToType}" to confirm`} value={typeToConfirm} setValue={setTypeToConfirm} />
            </div>
            <div>
              <ButtonPrimary disabled={typeToConfirm !== textToType || isPending} destructive={true} onClick={onDelete}>
                {isPending ? t("shared.deleting") : t("shared.delete")}
              </ButtonPrimary>
            </div>
          </div>
        </SettingSection>

        <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
      </div>
    </EditPageLayout>
  );
}
