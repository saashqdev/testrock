"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import CookieConsentSettings from "@/components/cookies/CookieConsentSettings";
import CookiesList from "@/components/cookies/CookiesList";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import PreviewIcon from "@/components/ui/icons/PreviewIcon";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import Modal from "@/components/ui/modals/Modal";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import BackButtonWithTitle from "@/components/ui/buttons/BackButtonWithTitle";
import { toast } from "sonner";
import { useAdminData } from "@/lib/state/useAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { actionAdminCookiesSettings } from "./actions";

interface ComponentProps {
  appConfiguration: AppConfigurationDto;
}

export default function AdminSettingsCookies({ appConfiguration }: ComponentProps) {
  const { t } = useTranslation();
  const adminData = useAdminData();

  const [canUpdate] = useState(getUserHasPermission(adminData, "admin.settings.cookies.update"));
  const [enabled, setEnabled] = useState(appConfiguration.cookies.enabled);
  const [showCookieSettingsModal, setShowCookieSettingsModal] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  async function onChangeEnabled(value: boolean) {
    setEnabled(value);
    setIsUpdating(true);

    try {
      const formData = new FormData();
      formData.set("action", "update");
      formData.set("enabled", value.toString());

      const result = await actionAdminCookiesSettings(null, formData);

      if (result?.success) {
        toast.success(result.success);
      } else if (result?.error) {
        toast.error(result.error);
        setEnabled(!value); // Revert on error
      }
    } catch (error) {
      toast.error("Failed to update settings");
      setEnabled(!value); // Revert on error
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <EditPageLayout
      title={<BackButtonWithTitle href="/admin/settings">{t("settings.admin.cookies.title")}</BackButtonWithTitle>}
      buttons={
        <>
          <ButtonSecondary onClick={() => setShowCookieSettingsModal(true)}>
            <PreviewIcon className="h-4 w-4" />
            <div>{t("shared.preview")}</div>
          </ButtonSecondary>
        </>
      }
    >
      <Modal open={showCookieSettingsModal} setOpen={setShowCookieSettingsModal}>
        <CookieConsentSettings onUpdated={() => setShowCookieSettingsModal(false)} />
      </Modal>

      <div>
        <InputCheckboxWithDescription
          name="enabled"
          value={enabled}
          onChange={(e) => onChangeEnabled(Boolean(e))}
          title="Enable cookie consent"
          description="Users need to accept or decline cookies to close the consent banner."
          disabled={!canUpdate || isUpdating}
        />

        <CookiesList editing={true} />
      </div>
    </EditPageLayout>
  );
}
