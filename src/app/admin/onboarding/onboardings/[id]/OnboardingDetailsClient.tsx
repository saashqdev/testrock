"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputGroup from "@/components/ui/forms/InputGroup";
import InputText from "@/components/ui/input/InputText";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import OnboardingFilterUtils from "@/modules/onboarding/utils/OnboardingFilterUtils";
import OnboardingStepUtils from "@/modules/onboarding/utils/OnboardingStepUtils";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { updateOnboarding, activateOnboarding, deleteOnboarding } from "./actions";

type ActionData = {
  error?: string;
  success?: string;
};

interface OnboardingDetailsClientProps {
  item: OnboardingWithDetailsDto;
  metadata: OnboardingFilterMetadataDto;
  itemId: string;
}

export default function OnboardingDetailsClient({ item, metadata, itemId }: OnboardingDetailsClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const appOrAdminData = useAppOrAdminData();

  const [title, setTitle] = useState(item.title);
  const [actionData, setActionData] = useState<ActionData | undefined>(undefined);

  const modalConfirm = useRef<RefConfirmModal>(null);

  async function handleUpdate(formData: FormData) {
    const result = await updateOnboarding(itemId, formData);
    setActionData(result);
    if (result.success) {
      router.refresh();
    }
  }

  function onActivate(active: boolean) {
    modalConfirm.current?.setValue(active);
    if (active) {
      modalConfirm.current?.show(
        t("onboarding.prompts.activate.title"),
        t("shared.confirm"),
        t("shared.back"),
        t("onboarding.prompts.activate.description")
      );
    } else {
      modalConfirm.current?.show(
        t("onboarding.prompts.deactivate.title"),
        t("shared.confirm"),
        t("shared.back"),
        t("onboarding.prompts.deactivate.description")
      );
    }
  }

  async function onConfirmActivate(active: boolean) {
    const result = await activateOnboarding(itemId, active);
    setActionData(result);
    if (result.success) {
      router.refresh();
    }
  }

  async function handleDelete() {
    const result = await deleteOnboarding(itemId);
    if (!result.error) {
      router.push("/admin/onboarding/onboardings");
    } else {
      setActionData(result);
    }
  }

  function canBeActivated() {
    if (item.filters.length > 0 && item.steps.length > 0) {
      return true;
    }
  }
  
  function canBeInactivated() {
    return true;
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      {item.active && <InfoBanner title={t("shared.active")} text="This onboarding is active and will be shown to users." />}

      <InputGroup title={t("shared.details")}>
        <form action={handleUpdate} className="divide-y-gray-200 space-y-4 divide-y">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-6">
            <div className="sm:col-span-6">
              <InputText disabled={item.active} name="title" title={t("onboarding.object.title")} value={title} setValue={setTitle} required />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <ButtonSecondary disabled={item.active || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")} type="submit">
              {t("shared.save")}
            </ButtonSecondary>
          </div>
        </form>
      </InputGroup>

      <InputGroup
        title={t("onboarding.step.plural")}
        right={
          <>
            <Link
              href={`/admin/onboarding/onboardings/${item.id}/steps`}
              className="text-muted-foreground hover:text-foreground text-sm font-medium hover:underline"
            >
              {t("onboarding.step.set")}
            </Link>
          </>
        }
      >
        <div className="space-y-2">
          {item.steps.length === 0 && (
            <Link
              href={`/admin/onboarding/onboardings/${item.id}/steps`}
              className="border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed p-4 text-center focus:outline-hidden focus:ring-2 focus:ring-gray-500"
            >
              <span className="text-muted-foreground block text-xs font-normal">{t("onboarding.step.empty.title")}</span>
            </Link>
          )}
          {item.steps.map((step, idx) => {
            return (
              <div key={idx} className="border-border bg-secondary relative block w-full rounded-lg border-2 border-dashed p-3 text-center">
                {OnboardingStepUtils.getStepDescription(OnboardingStepUtils.parseStepToBlock(step))}
              </div>
            );
          })}
        </div>
      </InputGroup>

      <InputGroup
        title={t("onboarding.filter.plural")}
        right={
          <>
            <Link
              href={`/admin/onboarding/onboardings/${item.id}/filters`}
              className="text-muted-foreground hover:text-foreground text-sm font-medium hover:underline"
            >
              {t("onboarding.filter.set")}
            </Link>
          </>
        }
      >
        <div className="space-y-2">
          {item.filters.length === 0 && (
            <Link
              href={`/admin/onboarding/onboardings/${item.id}/filters`}
              className="border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed p-4 text-center focus:outline-hidden focus:ring-2 focus:ring-gray-500"
            >
              <span className="text-muted-foreground block text-xs font-normal">{t("onboarding.filter.empty.title")}</span>
            </Link>
          )}
          {item.filters.map((filter, idx) => {
            return (
              <div key={idx} className="border-border bg-secondary relative block w-full rounded-lg border-2 border-dashed p-3 text-center">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="font-medium">{filter.type}</div>
                  {filter.value !== null && (
                    <>
                      <div>→</div>
                      <div className="text-muted-foreground italic">{OnboardingFilterUtils.parseValue({ t, filter, metadata })}</div>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </InputGroup>

      {!canBeActivated() && (
        <WarningBanner title={t("onboarding.errors.cannotBeActivated.title")} text={t("onboarding.errors.cannotBeActivated.description")} />
      )}

      <div className="flex justify-between">
        <div></div>
        <div className="flex justify-between space-x-2">
          {!item.active ? (
            <ButtonPrimary
              disabled={!canBeActivated() || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")}
              onClick={() => onActivate(true)}
              className="bg-teal-600 text-white hover:bg-teal-700"
            >
              {t("onboarding.prompts.activate.title")}
            </ButtonPrimary>
          ) : (
            <ButtonPrimary
              destructive
              disabled={!canBeInactivated() || !getUserHasPermission(appOrAdminData, "admin.onboarding.update")}
              onClick={() => onActivate(false)}
            >
              {t("onboarding.prompts.deactivate.title")}
            </ButtonPrimary>
          )}
        </div>
      </div>

      <ConfirmModal ref={modalConfirm} onYes={onConfirmActivate} />
      <ActionResultModal actionData={actionData} />
    </div>
  );
}
