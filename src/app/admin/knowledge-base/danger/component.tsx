"use client";

import { useActionState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { actionAdminKnowledgeBaseDanger } from "./actions";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";

export default function Component() {
  const { t } = useTranslation();
  const [actionData, action, pending] = useActionState(actionAdminKnowledgeBaseDanger, null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData?.error);
    } else if (actionData?.success) {
      toast.success(actionData?.success);
    }
  }, [actionData]);

  function onDelete() {
    confirmDelete.current?.show("Reset all Knowledge Base data?");
  }

  function onConfirmedDelete() {
    const form = document.getElementById("danger-form") as HTMLFormElement;
    if (form) {
      form.requestSubmit();
    }
  }

  return (
    <div className="flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Danger</h1>

        <form id="danger-form" action={action} className="divide-y-gray-200 mt-6 space-y-8 divide-y">
          <input name="action" value="reset-all-data" hidden readOnly />
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-6">
              <h2 className="text-xl font-medium text-foreground">Reset all data</h2>
              <p className="mt-1 text-sm text-muted-foreground">Delete all knowledge base data</p>
            </div>
          </div>

          <div className="flex justify-end pt-8">
            <ButtonPrimary destructive type="button" onClick={onDelete} disabled={pending}>
              {pending ? "Resetting..." : "Reset all data"}
            </ButtonPrimary>
          </div>
        </form>
      </div>
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}
