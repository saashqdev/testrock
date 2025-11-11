"use client";

import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { TenantWithDetailsDto } from "@/db/models/accounts/TenantsModel";
import UpdateTenantDetailsForm from "@/components/core/tenants/UpdateTenantDetailsForm";
import UsersTable from "@/components/core/users/UsersTable";
import { TenantSubscriptionWithDetailsDto } from "@/db/models/subscriptions/TenantSubscriptionsModel";
import { Fragment, useRef } from "react";
import ErrorModal, { RefErrorModal } from "@/components/ui/modals/ErrorModal";
import SuccessModal, { RefSuccessModal } from "@/components/ui/modals/SuccessModal";
import { useAdminData } from "@/lib/state/useAdminData";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { TenantType } from "@prisma/client";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SettingSection from "@/components/ui/sections/SettingSection";

interface ComponentProps {
  tenant: TenantWithDetailsDto;
  users: Awaited<ReturnType<typeof import("@/db").db.users.adminGetAllTenantUsers>>;
  subscription: TenantSubscriptionWithDetailsDto | null;
  subscriptionProducts: SubscriptionProductDto[];
  isStripeTest: boolean;
  tenantSettingsEntity: EntityWithDetailsDto | null;
  tenantTypes: TenantType[];
}

export default function Component({
  tenant,
  users,
  subscription,
  subscriptionProducts,
  isStripeTest,
  tenantSettingsEntity,
  tenantTypes,
}: ComponentProps) {
  const adminData = useAdminData();
  const params = useParams();
  const { t } = useTranslation();

  const errorModal = useRef<RefErrorModal>(null);
  const successModal = useRef<RefSuccessModal>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  function deleteAccount() {
    confirmDelete.current?.show(t("settings.danger.confirmDeleteTenant"), t("shared.confirm"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  
  async function confirmDeleteTenant() {
    try {
      const response = await fetch(`/api/admin/accounts/${params.id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      
      if (response.ok) {
        window.location.href = "/admin/accounts";
      } else {
        const error = await response.json();
        errorModal.current?.show(error.message || "Failed to delete tenant");
      }
    } catch (error) {
      errorModal.current?.show("An error occurred while deleting the tenant");
    }
  }

  return (
    <EditPageLayout
      title={tenant.name}
      menu={[
        { title: t("models.tenant.plural"), routePath: "/admin/accounts" },
        { title: tenant?.name ?? "", routePath: "/admin/accounts/" + params.id },
      ]}
    >
      <SettingSection title={t("settings.tenant.general")} description={t("settings.tenant.generalDescription")}>
        <div className="mt-5 md:col-span-2 md:mt-0">
          <UpdateTenantDetailsForm
            tenant={tenant}
            disabled={!getUserHasPermission(adminData, "admin.account.settings.update")}
            tenantSettingsEntity={tenantSettingsEntity}
            tenantTypes={tenantTypes}
            options={{
              canChangeType: true,
            }}
          />
        </div>
      </SettingSection>

      {/*Separator */}
      <div className="block">
        <div className="py-5">
          <div className="border-border border-t"></div>
        </div>
      </div>

      {/* Tenant Users */}
      {getUserHasPermission(adminData, "admin.account.users") && (
        <Fragment>
          <SettingSection title={t("models.user.plural")}>
            <div className="mt-5 md:col-span-2 md:mt-0">
              <UsersTable
                items={users}
                canImpersonate={getUserHasPermission(adminData, "admin.users.impersonate")}
                canChangePassword={getUserHasPermission(adminData, "admin.users.changePassword")}
                canSetUserRoles={false}
                canDelete={getUserHasPermission(adminData, "admin.users.delete")}
              />
            </div>
          </SettingSection>

          {/*Separator */}
          <div className="block">
            <div className="py-5">
              <div className="border-border border-t"></div>
            </div>
          </div>
        </Fragment>
      )}

      {/*Danger */}
      {getUserHasPermission(adminData, "admin.account.delete") && (
        <SettingSection title={t("settings.danger.title")} description={t("settings.danger.description")}>
          <div className="mt-12 md:col-span-2 md:mt-0">
            <div>
              <input hidden type="text" name="action" value="deleteAccount" readOnly />
              <div className="">
                <div className="">
                  <h3 className="text-foreground text-lg font-medium leading-6">Delete account</h3>
                  <div className="text-muted-foreground mt-2 max-w-xl text-sm leading-5">
                    <p>Delete organization and cancel subscriptions.</p>
                  </div>
                  <div className="mt-4">
                    <ButtonPrimary destructive={true} onClick={deleteAccount}>
                      {t("settings.danger.deleteAccount")}
                    </ButtonPrimary>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SettingSection>
      )}

      <ConfirmModal ref={confirmDelete} onYes={confirmDeleteTenant} />
      <SuccessModal ref={successModal} />
      <ErrorModal ref={errorModal} />
    </EditPageLayout>
  );
}
