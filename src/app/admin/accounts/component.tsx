"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { TenantDto, TenantWithUsageDto } from "@/db/models/accounts/TenantsModel";
import TenantsTable from "@/components/core/tenants/TenantsTable";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import InputFilters from "@/components/ui/input/InputFilters";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { useEffect, useRef, useState, useTransition } from "react";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import Stripe from "stripe";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import FormGroup from "@/components/ui/forms/FormGroup";
import InputText, { RefInputText } from "@/components/ui/input/InputText";
import RowProperties from "@/components/entities/rows/RowProperties";
import UrlUtils from "@/utils/app/UrlUtils";
import DeactivateTenantModal from "@/components/core/tenants/DeactivateTenantModal";
import { Button } from "@/components/ui/button";
import { toggleTenantActive, createTenant } from "./actions";

interface ComponentProps {
  items: TenantWithUsageDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  tenantInvoices: Stripe.Invoice[];
  isStripeTest: boolean;
  tenantSettingsEntity: EntityWithDetailsDto | null;
}

export default function Component({
  items,
  filterableProperties,
  pagination,
  tenantInvoices,
  isStripeTest,
  tenantSettingsEntity,
}: ComponentProps) {
  const appOrAdminData = useAppOrAdminData();
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [deactivatingTenant, setDeactivatingTenant] = useState<TenantWithUsageDto>();
  const [creatingNewAccount, setCreatingNewAccount] = useState(false);
  const [actionData, setActionData] = useState<any>();

  function onToggleActive(item: TenantWithUsageDto) {
    if (!item.deactivatedReason) {
      setDeactivatingTenant(item);
    } else {
      onConfirmedToggleActive(item, "", true);
    }
  }

  async function onConfirmedToggleActive(value: TenantDto, reason: string, activate: boolean) {
    startTransition(async () => {
      const result = await toggleTenantActive(value.id, !activate ? "deactivate" : "activate", reason);
      if (result.error) {
        setActionData({ error: result.error });
      } else {
        router.refresh();
      }
    });

    setDeactivatingTenant(undefined);
  }

  async function handleCreateTenant(formData: FormData) {
    startTransition(async () => {
      const result = await createTenant(formData);
      if (result.error) {
        setActionData({ error: result.error });
      } else if (result.createdTenantId) {
        setCreatingNewAccount(false);
        router.refresh();
      }
    });
  }

  return (
    <EditPageLayout
      title={t("models.tenant.plural")}
      buttons={
        <>
          <InputFilters size="sm" filters={filterableProperties} />
          <Button
            type="button"
            variant="default"
            size="sm"
            disabled={!getUserHasPermission(appOrAdminData, "admin.accounts.create")}
            onClick={() => setCreatingNewAccount(true)}
          >
            {t("shared.new")}
          </Button>
        </>
      }
    >
      <TenantsTable
        items={items}
        pagination={pagination}
        tenantInvoices={tenantInvoices}
        isStripeTest={isStripeTest}
        actions={[
          {
            renderTitle: (i) => (!i.deactivatedReason ? t("shared.deactivate") : t("shared.activate")),
            onClick: (_idx, item) => onToggleActive(item),
            disabled: () => isPending,
            renderIsDestructive: (i) => !i.deactivatedReason,
          },
        ]}
      />

      <DeactivateTenantModal
        open={!!deactivatingTenant}
        onClose={() => setDeactivatingTenant(undefined)}
        item={deactivatingTenant}
        onConfirm={(item, reason) => onConfirmedToggleActive(item, reason, false)}
      />

      <SlideOverWideEmpty
        title={"New Account"}
        open={creatingNewAccount}
        onClose={() => {
          setCreatingNewAccount(false);
        }}
        size="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">
            <CreateTenantForm tenantSettingsEntity={tenantSettingsEntity} onSubmit={handleCreateTenant} />
          </div>
        </div>
      </SlideOverWideEmpty>

      <ActionResultModal actionData={actionData} />
    </EditPageLayout>
  );
}

function CreateTenantForm({
  tenantSettingsEntity,
  onSubmit,
}: {
  tenantSettingsEntity: EntityWithDetailsDto | null;
  onSubmit: (formData: FormData) => void;
}) {
  const { t } = useTranslation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [addMySelf, setAddMySelf] = useState(true);

  useEffect(() => {
    setSlug(UrlUtils.slugify(name));
  }, [name]);

  const firstInput = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      firstInput.current?.input.current?.focus();
    }, 100);
  }, []);

  return (
    <FormGroup
      labels={{
        create: t("shared.create"),
      }}
      withErrorModal={false}
      onSubmit={onSubmit}
    >
      <div className="space-y-3">
        <InputText ref={firstInput} autoFocus name="name" title={t("shared.name")} value={name} setValue={setName} required />
        <InputText name="slug" title={t("shared.slug")} value={slug} setValue={setSlug} required onBlur={() => setSlug(UrlUtils.slugify(slug))} />
        {tenantSettingsEntity && (
          <div className="col-span-6 sm:col-span-6">
            <RowProperties entity={tenantSettingsEntity} item={null} />
          </div>
        )}
        <InputCheckboxWithDescription
          name="addMySelf"
          title="Add myself as owner"
          description="You will be added as owner of the new account."
          value={addMySelf}
          onChange={setAddMySelf}
        />
      </div>
    </FormGroup>
  );
}
