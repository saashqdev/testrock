"use client";

import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import InputFilters from "@/components/ui/input/InputFilters";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import OnboardingSessionsTable from "@/modules/onboarding/components/OnboardingSessionsTable";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { LoaderData } from "../../api/sessions/OnboardingSessionsIndexApi.server";

interface OnboardingSessionsIndexRouteProps {
  data: LoaderData;
}

export default function OnboardingSessionsIndexRoute({ data }: OnboardingSessionsIndexRouteProps) {
  const { t } = useTranslation();
  const [actionData, setActionData] = useState<{ error?: string; success?: string } | null>(null);

  const modalConfirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(item: OnboardingSessionWithDetailsDto) {
    modalConfirmDelete.current?.setValue(item.id);
    modalConfirmDelete.current?.show(
      t("onboarding.prompts.deleteSession.title"),
      t("shared.confirm"),
      t("shared.back"),
      t("onboarding.prompts.deleteSession.description")
    );
  }
  async function onConfirmDelete(id: string) {
    try {
      const formData = new FormData();
      formData.set("action", "delete");
      formData.set("id", id);

      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setActionData({ success: result.success || "Session deleted successfully" });
        // Reload the page to show updated data
        setTimeout(() => window.location.reload(), 1000);
      } else {
        setActionData({ error: result.error || "Failed to delete session" });
      }
    } catch (error) {
      console.error("Error deleting session:", error);
      setActionData({ error: "An error occurred while deleting the session" });
    }
  }

  return (
    <>
      <div className="md:border-b md:border-border md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-foreground">Sessions</h3>
          <div className="flex items-center space-x-2">
            <InputFilters filters={data.filterableProperties} />
          </div>
        </div>
      </div>

      <OnboardingSessionsTable items={data.items} metadata={data.metadata} onDelete={onDelete} />
      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </>
  );
}
