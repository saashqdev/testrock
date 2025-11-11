"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputGroup from "@/components/ui/forms/InputGroup";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { deleteOnboarding } from "../actions";

type DangerZoneProps = {
  item: OnboardingWithDetailsDto;
};

export default function DangerZone({ item }: DangerZoneProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const appOrAdminData = useAppOrAdminData();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<{ error?: string; success?: string }>();

  const modalConfirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    modalConfirmDelete.current?.show(
      t("onboarding.prompts.deleteOnboarding.title"),
      t("shared.confirm"),
      t("shared.back"),
      t("onboarding.prompts.deleteOnboarding.description")
    );
  }

  async function onConfirmDelete() {
    startTransition(async () => {
      try {
        const result = await deleteOnboarding(item.id);
        
        if (result?.error) {
          setActionData({ error: result.error });
        } else {
          // If successful, the server action will redirect
          // But if we get here, show success message
          setActionData({ success: "Onboarding deleted successfully" });
        }
      } catch (error) {
        // The redirect from server action will throw, which is expected
        // Only set error if it's not a redirect
        if (error instanceof Error && !error.message.includes("NEXT_REDIRECT")) {
          setActionData({ error: "An unexpected error occurred" });
        }
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      {item.active && <ErrorBanner title={t("shared.warning")} text="You cannot delete an active onboarding." />}

      <InputGroup title={t("shared.dangerZone")} className="bg-red-50">
        <ButtonSecondary 
          disabled={item.active || !getUserHasPermission(appOrAdminData, "admin.onboarding.delete") || isPending} 
          destructive 
          onClick={onDelete}
        >
          {isPending ? t("shared.deleting") || "Deleting..." : t("shared.delete")}
        </ButtonSecondary>
      </InputGroup>

      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} />
    </div>
  );
}
