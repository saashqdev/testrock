"use client";

import { useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";
import { setUserRolesAction } from "@/app/admin/accounts/users/[user]/roles/actions";

interface UserRolesFormProps {
  user: UserWithDetailsDto;
  adminRoles: RoleWithPermissionsDto[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UserRolesForm({ user, adminRoles, onSuccess, onCancel }: UserRolesFormProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [selectedRoles, setSelectedRoles] = useState<string[]>(
    user.roles?.filter((f) => f.role.type === "admin").map((r) => r.role.id) || []
  );
  const [actionData, setActionData] = useState<{ error?: string; success?: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    startTransition(async () => {
      const result = await setUserRolesAction(user.id, selectedRoles);
      if (result.error) {
        setActionData({ error: result.error });
      } else if (result.success) {
        setActionData({ success: result.success });
        setTimeout(() => {
          onSuccess?.();
        }, 1000);
      } else {
        onSuccess?.();
      }
    });
  }

  function hasSomeAdminRoles() {
    return adminRoles.some((ar) => selectedRoles?.includes(ar.id));
  }
  
  function hasAllAdminRoles() {
    return adminRoles.every((ar) => selectedRoles?.includes(ar.id));
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <div className="border-border flex items-center justify-between space-x-2 border-b pb-2">
          <div className="text-foreground/80 text-lg font-medium">{t("models.role.plural")}</div>
          <div className="flex items-center space-x-2">
            <ButtonSecondary disabled={!hasSomeAdminRoles()} onClick={() => setSelectedRoles([])}>
              {t("shared.clear")}
            </ButtonSecondary>

            <ButtonSecondary disabled={hasAllAdminRoles()} onClick={() => setSelectedRoles(adminRoles.map((r) => r.id))}>
              {t("shared.selectAll")}
            </ButtonSecondary>
          </div>
        </div>
        <div className="relative mt-1 rounded-md shadow-2xs">
          {adminRoles?.map((role, idx) => (
            <InputCheckboxWithDescription
              key={idx}
              name={role.name}
              title={role.name}
              description={role.description}
              value={selectedRoles.includes(role.id)}
              onChange={(e) => {
                if (e) {
                  setSelectedRoles((f) => [...f, role.id]);
                } else {
                  setSelectedRoles((f) => f.filter((f) => f !== role.id));
                }
              }}
            />
          ))}
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <ButtonSecondary type="button" className="w-full" onClick={onCancel}>
            <div className="w-full text-center">{t("shared.cancel")}</div>
          </ButtonSecondary>
          <LoadingButton type="submit" disabled={isPending} className="w-full">
            {t("shared.save")}
          </LoadingButton>
        </div>
      </form>
      <ActionResultModal actionData={actionData ?? undefined} />
    </>
  );
}
