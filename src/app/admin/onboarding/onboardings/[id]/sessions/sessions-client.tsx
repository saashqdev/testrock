"use client";

import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import OnboardingSessionsTable from "@/modules/onboarding/components/OnboardingSessionsTable";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingSessionWithDetailsDto } from "@/db/models/onboarding/OnboardingSessionsModel";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";

type PageData = {
  item: OnboardingWithDetailsDto;
  items: OnboardingSessionWithDetailsDto[];
  metadata: OnboardingFilterMetadataDto;
};

type ActionData = {
  error?: string;
  success?: string;
};

type Props = {
  data: PageData;
  deleteSession: (id: string) => Promise<ActionData>;
};

export default function OnboardingSessionsClient({ data, deleteSession }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData | null>(null);

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
    startTransition(async () => {
      const result = await deleteSession(id);
      setActionData(result);

      if (result.success) {
        // Refresh the page data
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      <div className="space-y-3">
        <div className="space-y-2">
          <h3 className="text-sm font-medium leading-3 text-foreground">{t("onboarding.session.plural")}</h3>
          <p className="text-sm text-muted-foreground">Sessions represent the current state of an onboarding process.</p>
        </div>
        {!data.item.active && <WarningBanner title={t("shared.warning")} text="Current onboarding is not active, sessions will not be created/loaded." />}
        <OnboardingSessionsTable items={data.items} withOnboarding={false} onDelete={onDelete} metadata={data.metadata} />
      </div>
      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}
