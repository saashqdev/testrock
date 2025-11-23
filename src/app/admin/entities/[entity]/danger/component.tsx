"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { useAdminData } from "@/lib/state/useAdminData";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { handleDangerAction } from "./actions";

type DangerPageProps = {
  entity: EntityWithDetailsDto;
  count: number;
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function DangerComponent({ entity, count }: DangerPageProps) {
  const { t } = useTranslation();
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const adminData = useAdminData();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete(action: string) {
    confirmDelete.current?.setValue(action);
    let title = t("shared.delete");
    let button = t("shared.delete");
    if (action === "delete") {
      title = `Delete ${t(entity.title)} entity`;
      button = `Delete ${t(entity.title)} entity`;
    } else {
      title = `Delete ${t(entity.title)} rows (${count})`;
      button = `Delete ${t(entity.title)} rows (${count})`;
    }
    confirmDelete.current?.show(title, button, t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  async function onDeleteConfirmed(action: string) {
    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("action", action);
        formData.set("entitySlug", entity.slug);

        const result = await handleDangerAction(formData);

        if (result.redirect) {
          router.push(result.redirect);
        } else {
          setActionData(result);
          if (result.success) {
            router.refresh();
          }
        }
      } catch (error: any) {
        setActionData({ error: error.message || "An error occurred" });
      }
    });
  }

  function canDelete() {
    return !adminData?.isSuperAdmin || !getUserHasPermission(adminData, "admin.entities.delete");
  }
  return (
    <div className="space-y-3">
      <div className="md:py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium leading-6 text-foreground">Danger</h3>
        </div>
        <p className="pt-2 text-sm text-red-900 dark:text-red-500">These actions cannot be undone.</p>
      </div>

      <div className="flex items-center space-x-2">
        <ButtonPrimary disabled={canDelete() || count > 0} destructive onClick={() => onDelete("delete")}>
          Delete {entity.title} entity
        </ButtonPrimary>

        <ButtonPrimary disabled={canDelete() || count === 0} destructive onClick={() => onDelete("delete-all-rows")}>
          Delete {count} rows (SuperAdmin only)
        </ButtonPrimary>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} destructive />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </div>
  );
}
