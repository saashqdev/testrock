"use client";

import { FormEvent, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import OnboardingBlock from "@/modules/onboarding/blocks/OnboardingBlock";
import OnboardingBlockForm from "@/modules/onboarding/blocks/OnboardingBlockForm";
import { OnboardingBlockDto, OnboardingHeightDto, OnboardingStepBlockDto } from "@/modules/onboarding/blocks/OnboardingBlockUtils";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";

type OnboardingStepsClientProps = {
  data: {
    item: OnboardingWithDetailsDto;
  };
  setSteps: (formData: FormData, onboardingId: string) => Promise<{ error?: string; success?: string }>;
  onboardingId: string;
};

export default function OnboardingStepsClient({ data, setSteps, onboardingId }: OnboardingStepsClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [isPending, startTransition] = useTransition();

  const [showPreview, setShowPreview] = useState(false);
  const [actionData, setActionData] = useState<{ error?: string; success?: string }>();

  const [onboardingBlock, setOnboardingBlock] = useState<OnboardingBlockDto>({
    style: data.item.type as any,
    title: data.item.title,
    canBeDismissed: data.item.canBeDismissed,
    height: (data.item.height ?? "md") as OnboardingHeightDto,
    steps: data.item.steps.map((f) => {
      const block = JSON.parse(f.block) as OnboardingStepBlockDto;
      return block;
    }),
  });

  const modalConfirm = useRef<RefConfirmModal>(null);

  function onUpdateOnboardingBlock(item: OnboardingBlockDto) {
    setOnboardingBlock(item);
  }

  function onSave(e: FormEvent<HTMLFormElement>) {
    e.stopPropagation();
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    if (data.item.sessions.length > 0) {
      modalConfirm.current?.setValue(formData);
      modalConfirm.current?.show(
        t("onboarding.prompts.updateSteps.title", { 0: data.item.sessions.length }),
        t("shared.confirm"),
        t("shared.back"),
        t("onboarding.prompts.updateSteps.description")
      );
    } else {
      onConfirmSave(formData);
    }
  }

  function onConfirmSave(form: FormData) {
    startTransition(async () => {
      const result = await setSteps(form, onboardingId);
      setActionData(result);
    });
  }

  return (
    <form method="post" onSubmit={onSave} className="mx-auto flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      <input type="hidden" name="action" value="set-steps" hidden readOnly />
      <input type="hidden" name="block" value={JSON.stringify(onboardingBlock)} hidden readOnly />

      {data.item.active ? (
        <ErrorBanner title={t("shared.warning")} text="You cannot edit an active onboarding." />
      ) : data.item.sessions.length > 0 ? (
        <WarningBanner
          title={t("onboarding.prompts.updateSteps.title", { 0: data.item.sessions.length })}
          text={t("onboarding.prompts.updateSteps.description")}
        />
      ) : null}

      <div>
        <OnboardingBlock open={showPreview} onClose={() => setShowPreview(false)} item={onboardingBlock} />
        <OnboardingBlockForm item={onboardingBlock} onUpdate={onUpdateOnboardingBlock} />
      </div>

      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowPreview(true)}
          className="hover:bg-secondary border-border text-muted-foreground hover:text-foreground bg-background flex w-full justify-center rounded-lg border-2 border-dashed p-4 shadow-lg hover:border-dashed hover:border-gray-600 focus:outline-hidden"
        >
          {t("shared.clickHereTo", { 0: t("shared.preview").toLowerCase() })}
        </button>
      </div>

      <div className="border-border flex justify-between border-t pt-4">
        <div></div>
        <div>
          <LoadingButton disabled={data.item.active || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")} type="submit">
            {t("shared.save")}
          </LoadingButton>
        </div>
      </div>

      <ConfirmModal ref={modalConfirm} onYes={onConfirmSave} />
      <ActionResultModal actionData={actionData} />
    </form>
  );
}
