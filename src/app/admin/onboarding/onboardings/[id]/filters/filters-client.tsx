"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { Colors } from "@/lib/enums/shared/Colors";
import TenantCell from "@/components/core/tenants/TenantCell";
import UserBadge from "@/components/core/users/UserBadge";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputGroup from "@/components/ui/forms/InputGroup";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import InputSelector from "@/components/ui/input/InputSelector";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import Modal from "@/components/ui/modals/Modal";
import TableSimple from "@/components/ui/tables/TableSimple";
import { languages } from "@/i18n/settings";
import { OnboardingWithDetailsDto } from "@/db/models/onboarding/OnboardingModel";
import { OnboardingCandidateDto } from "@/modules/onboarding/dtos/OnboardingCandidateDto";
import { OnboardingFilterDto } from "@/modules/onboarding/dtos/OnboardingFilterDto";
import { OnboardingFilterMetadataDto } from "@/modules/onboarding/dtos/OnboardingFilterMetadataDto";
import { OnboardingFilterType, OnboardingFilterTypes } from "@/modules/onboarding/dtos/OnboardingFilterTypes";
import OnboardingFilterUtils from "@/modules/onboarding/utils/OnboardingFilterUtils";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { updateFiltersAction, updateRealtimeAction, saveSessionsAction } from "../actions";

type LoaderData = {
  meta: MetaTagsDto;
  item: OnboardingWithDetailsDto;
  candidates: OnboardingCandidateDto[];
  metadata: OnboardingFilterMetadataDto;
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function OnboardingFiltersClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData | null>(null);

  const [showModal, setShowModal] = useState<{ item?: OnboardingFilterDto; idx?: number }>();

  const [filters, setFilters] = useState<OnboardingFilterDto[]>(
    data.item.filters.map((f) => {
      return {
        type: f.type as OnboardingFilterDto["type"],
        value: f.value,
      };
    })
  );

  useEffect(() => {
    if (filters !== data.item.filters) {
      startTransition(async () => {
        const result = await updateFiltersAction(data.item.id, filters);
        setActionData(result);
        if (result.success) {
          router.refresh();
        }
      });
    }
  }, [filters, data.item.id, data.item.filters, router]);

  function onSetRealtime(realtime: boolean) {
    startTransition(async () => {
      const result = await updateRealtimeAction(data.item.id, realtime);
      setActionData(result);
      if (result.success) {
        router.refresh();
      }
    });
  }
  function onSaveFilter(item: OnboardingFilterDto) {
    const idx = showModal?.idx;
    if (idx !== undefined) {
      filters[idx] = item;
    } else {
      filters.push(item);
    }
    setFilters([...filters]);
    setShowModal(undefined);
  }

  function onDeleteFilter() {
    const idx = showModal?.idx;
    if (idx !== undefined) {
      filters.splice(idx, 1);
      setFilters([...filters]);
    }
    setShowModal(undefined);
  }

  function onSaveSessions() {
    startTransition(async () => {
      const result = await saveSessionsAction(data.item.id, data.candidates);
      setActionData(result);
      if (result.success) {
        router.refresh();
      }
    });
  }

  return (
    <div className="mx-auto flex-1 space-y-5 overflow-x-auto px-2 py-2 xl:overflow-y-auto">
      {data.item.active && <ErrorBanner title={t("shared.warning")} text="You cannot edit an active onboarding." />}

      <InputGroup title={t("onboarding.object.filters")} description="Filters are used to determine if the onboarding should be shown to the user.">
        <div>
          <InputCheckboxWithDescription
            disabled={data.item.active}
            name="realtime"
            title="Realtime"
            description="Sessions will be created in realtime when the user matches the filters"
            value={data.item.realtime}
            onChange={(e) => onSetRealtime(Boolean(e))}
          />

          <div className="space-y-2">
            {filters.map((filter, idx) => {
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={data.item.active}
                  onClick={() => setShowModal({ item: filter, idx })}
                  className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-3 text-center hover:border-border focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <div className="flex items-center space-x-2 text-sm">
                    <div className="font-medium">{filter.type}</div>
                    {filter.value !== null && (
                      <>
                        <div>→</div>
                        <div className="italic text-muted-foreground">{OnboardingFilterUtils.parseValue({ t, filter, metadata: data.metadata })}</div>
                      </>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="">
              <button
                type="button"
                disabled={data.item.active}
                onClick={() => setShowModal({ item: undefined, idx: undefined })}
                className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-3 text-center hover:border-border focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="block text-sm font-medium text-foreground">Add filter</span>
              </button>
            </div>
          </div>

          {/* <div className="flex justify-end pt-4">
            <LoadingButton actionName="set-filters" type="submit">
              {t("shared.save")}
            </LoadingButton>
          </div> */}

          <OnboardingFilterModal
            open={showModal !== undefined}
            item={showModal?.item}
            idx={showModal?.idx}
            onClose={() => setShowModal(undefined)}
            onSave={onSaveFilter}
            metadata={data.metadata}
            onDelete={onDeleteFilter}
          />
        </div>
      </InputGroup>

      <div className="space-y-3">
        <div className="flex justify-between space-x-2">
          <div>
            <h3 className="text-sm font-medium leading-3 text-foreground">Candidates</h3>
            <p className="mt-1 text-sm text-muted-foreground">Users that match the filters.</p>
          </div>
          <div>
            {!data.item.realtime && (
              <ButtonPrimary disabled={data.item.active} onClick={onSaveSessions}>
                Save {data.candidates.length} sessions
              </ButtonPrimary>
            )}
          </div>
        </div>
        <TableSimple
          items={data.candidates}
          headers={[
            {
              name: "tenant",
              title: t("models.tenant.object"),
              value: (item) => <TenantCell item={item.tenant} />,
            },
            {
              name: "user",
              title: t("models.user.object"),
              value: (i) => <UserBadge item={i.user} />,
            },
            {
              name: "matchingFilters",
              title: t("onboarding.filter.matching"),
              value: (i) => (
                <div className="flex flex-col">
                  {i.matchingFilters.length === 0 && <div className="italic text-muted-foreground">No filters - All users are candidates</div>}
                  {i.matchingFilters.map((filter, idx) => {
                    return (
                      <div key={idx} className="text-sm">
                        <div className="flex items-center space-x-2">
                          <div className="font-medium">{filter.type}</div>
                          {filter.value !== null && (
                            <>
                              <div>→</div>
                              <div className="italic text-muted-foreground">{OnboardingFilterUtils.parseValue({ t, filter, metadata: data.metadata })}</div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ),
            },
          ]}
        />
      </div>

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}

function OnboardingFilterModal({
  item,
  idx,
  open,
  onClose,
  onSave,
  onDelete,
  metadata,
}: {
  item?: OnboardingFilterDto;
  idx: number | undefined;
  open: boolean;
  onClose: () => void;
  onSave: (item: OnboardingFilterDto) => void;
  onDelete: () => void;
  metadata: OnboardingFilterMetadataDto;
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [filter, setFilter] = useState<OnboardingFilterDto>();
  useEffect(() => {
    if (item) {
      setFilter(item);
    } else {
      setFilter({ type: "user.is", value: appOrAdminData?.user?.id ?? "" });
    }
  }, [appOrAdminData?.user?.id, item, idx]);

  function onConfirm() {
    if (filter) {
      onSave(filter);
    }
  }

  return (
    <Modal open={open} setOpen={onClose} size="md">
      <div className="inline-block w-full p-1 text-left align-bottom sm:align-middle">
        <input name="action" type="hidden" value="create" readOnly hidden />
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-medium leading-6 text-foreground">{idx === undefined ? "Add filter" : "Edit filter"}</h3>
        </div>
        <div className="mt-4 space-y-2">
          <InputSelector
            name="type"
            title={t("onboarding.object.type")}
            value={filter?.type}
            withSearch={true}
            setValue={(e) => setFilter({ ...filter, type: e as OnboardingFilterType, value: null })}
            options={OnboardingFilterTypes.map((f) => {
              return { value: f, name: f };
            })}
            required
          />
          {filter?.type === "tenant.is" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.tenants.map((t) => {
                return { value: t.id, name: t.name };
              })}
              required
            />
          ) : filter?.type === "user.is" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.users.map((t) => {
                return { value: t.id, name: t.email };
              })}
              required
            />
          ) : filter?.type === "user.roles.contains" || filter?.type === "user.roles.notContains" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              withColors={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.roles.map((t) => {
                return {
                  value: t.name,
                  name: t.type === "admin" ? `[admin] ${t.name}` : t.name,
                  color: t.type === "admin" ? Colors.RED : Colors.INDIGO,
                };
              })}
              required
            />
          ) : filter?.type === "tenant.subscription.products.has" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={metadata.subscriptionProducts.map((f) => {
                return { value: f.id, name: t(f.title) };
              })}
              required
            />
          ) : filter?.type.startsWith("tenant.user.entity") ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              withColors={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={(appOrAdminData?.entities ?? []).map((f) => {
                return {
                  value: f.id,
                  name: t(f.titlePlural),
                };
              })}
              required
            />
          ) : filter?.type === "user.language" ? (
            <InputSelector
              name="value"
              title={t("onboarding.filter.value")}
              value={filter.value ?? undefined}
              withSearch={true}
              withColors={true}
              setValue={(e) => setFilter({ ...filter, value: e?.toString() ?? null })}
              options={languages.map((f) => {
                return {
                  value: f,
                  name: t("shared.locales." + f),
                };
              })}
              required
            />
          ) : (
            <></>
            // <InputText
            //   name="value"
            //   title={t("onboarding.filter.value")}
            //   value={filter.value ?? undefined}
            //   setValue={(e) => setFilter({ ...filter, value: e.toString() ?? null })}
            //   required
            // />
          )}
        </div>
        <div className="mt-3 flex justify-between border-t border-border pt-3">
          <div>
            <ButtonSecondary destructive type="button" onClick={onDelete} className="flex justify-center" disabled={idx === undefined}>
              {t("shared.delete")}
            </ButtonSecondary>
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary type="button" onClick={onClose} className="flex justify-center">
              {t("shared.cancel")}
            </ButtonSecondary>
            <ButtonPrimary disabled={!getUserHasPermission(appOrAdminData, "admin.onboarding.update")} onClick={onConfirm} className="flex justify-center">
              {t("shared.save")}
            </ButtonPrimary>
          </div>
        </div>
      </div>
    </Modal>
  );
}
