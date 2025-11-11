"use client";

import { Tenant } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useState, useRef, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ServerError from "@/components/ui/errors/ServerError";
import InputGroup from "@/components/ui/forms/InputGroup";
import InputSelector from "@/components/ui/input/InputSelector";
import InputText from "@/components/ui/input/InputText";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingFilterDto } from "@/modules/onboarding/dtos/OnboardingFilterDto";
import { OnboardingFilterType, OnboardingFilterTypes } from "@/modules/onboarding/dtos/OnboardingFilterTypes";
import SessionFilterModal from "@/modules/shared/components/SessionFilterModal";
import { UserWithNamesDto } from "@/db/models/accounts/UsersModel";
import { updateSettingsAction, setFiltersAction, deleteOnboarding } from "../actions";


type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetailsDto;
  metadata: {
    users: UserWithNamesDto[];
    tenants: Tenant[];
    subscriptionProducts: SubscriptionProductDto[];
    roles: { id: string; name: string }[];
  };
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function OnboardingSettingsPage({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData | null>(null);

  const [showFilterModal, setShowFilterModal] = useState<{ item?: OnboardingFilterDto; idx?: number }>();

  const [title, setTitle] = useState(data.item.title);
  const [type, setType] = useState(data.item.type);
  const [filters, setFilters] = useState<OnboardingFilterDto[]>(
    data.item.filters.map((f) => {
      return {
        type: f.type as OnboardingFilterDto["type"],
        value: f.value,
      };
    })
  );

  const modalConfirmDelete = useRef<RefConfirmModal>(null);

  function handleUpdateSettings(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      const result = await updateSettingsAction(data.item.id, formData);
      setActionData(result);
      if (result.success) {
        router.refresh();
      }
    });
  }

  function handleSetFilters(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    startTransition(async () => {
      const result = await setFiltersAction(data.item.id, filters);
      setActionData(result);
      if (result.success) {
        router.refresh();
      }
    });
  }

  function onDelete() {
    modalConfirmDelete.current?.show(
      t("onboarding.prompts.deleteOnboarding.title"),
      t("shared.confirm"),
      t("shared.back"),
      t("onboarding.prompts.deleteOnboarding.description")
    );
  }

  function onConfirmDelete() {
    startTransition(async () => {
      const result = await deleteOnboarding(data.item.id);
      setActionData(result);
      // The deleteOnboarding action will redirect on success
    });
  }

  function onSaveFilter(item: { type: OnboardingFilterType; value: string | null }) {
    const idx = showFilterModal?.idx;
    if (idx !== undefined) {
      filters[idx] = item;
    } else {
      filters.push(item);
    }
    setFilters([...filters]);
    setShowFilterModal(undefined);
  }

  return (
    <div className="mx-auto max-w-2xl flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      <InputGroup title={t("shared.details")}>
        <form onSubmit={handleUpdateSettings} className="divide-y-gray-200 space-y-4 divide-y">
          <input name="action" value="update" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-3">
              <InputText name="title" title={t("onboarding.object.title")} value={title} setValue={setTitle} />
            </div>
            <div className="sm:col-span-3">
              <InputSelector
                name="type"
                title={t("onboarding.object.type")}
                value={type}
                withSearch={false}
                options={[
                  { value: "modal", name: "Modal" },
                  { value: "page", name: "Page" },
                ]}
                setValue={(e) => setType(e?.toString() ?? "")}
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <LoadingButton disabled={isPending} type="submit">
              {t("shared.save")}
            </LoadingButton>
          </div>
        </form>
      </InputGroup>

      <InputGroup title={t("onboarding.object.filters")}>
        <form onSubmit={handleSetFilters} className="space-y-2">
          <input name="action" value="set-filters" hidden readOnly />
          {filters.map((filter, index) => {
            return <input type="hidden" name="filters[]" value={JSON.stringify(filter)} key={index} hidden readOnly />;
          })}

          <p className="text-muted-foreground text-sm">Filters are used to determine if the onboarding should be shown to the user.</p>

          <div className="space-y-2">
            {filters.map((filter, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setShowFilterModal({ item: filter, idx })}
                  className="border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed p-3 text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="flex items-center space-x-1">
                    <div className="font-medium">{filter.type}</div>
                    <div className="italic">{filter.value === null ? <span className="text-red-500">null</span> : filter.value}</div>
                  </div>
                </button>
              );
            })}

            <div className="">
              <button
                type="button"
                onClick={() => setShowFilterModal({ item: undefined, idx: undefined })}
                className="border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed p-3 text-center focus:outline-hidden focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="text-foreground block text-sm font-medium">Add filter</span>
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <LoadingButton disabled={isPending} type="submit">
              {t("shared.save")}
            </LoadingButton>
          </div>

          <SessionFilterModal
            filters={OnboardingFilterTypes.map((f) => f.toString())}
            open={showFilterModal !== undefined}
            item={showFilterModal?.item}
            idx={showFilterModal?.idx}
            onClose={() => setShowFilterModal(undefined)}
            onSave={({ type, value }) => onSaveFilter({ type: type as OnboardingFilterType, value })}
            metadata={data.metadata}
            onRemove={(idx) => {
              filters.splice(idx, 1);
              setFilters([...filters]);
            }}
          />
        </form>
      </InputGroup>

      <InputGroup title={t("shared.dangerZone")} className="bg-red-50">
        <ButtonSecondary destructive onClick={onDelete}>
          {t("shared.delete")}
        </ButtonSecondary>
      </InputGroup>

      <ConfirmModal ref={modalConfirmDelete} onYes={onConfirmDelete} />
      <ActionResultModal actionData={actionData} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
