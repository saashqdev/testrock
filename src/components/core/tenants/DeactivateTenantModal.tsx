"use client";

import { useRouter } from "next/navigation";
import clsx from "clsx";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modals/Modal";
import { TenantDto } from "@/db/models/accounts/TenantsModel";

export default function DeactivateTenantModal({
  item,
  open,
  onClose,
  onConfirm,
}: {
  item?: TenantDto;
  open: boolean;
  onClose: () => void;
  onConfirm: (item: TenantDto, reason: string) => void;
}) {
  const { t } = useTranslation();
  const router = useRouter();

  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!item || isSubmitting) {
      return;
    }
    setIsSubmitting(true);
    try {
      await onConfirm(item, reason);
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <Modal open={open} setOpen={onClose} size="md">
      {!item ? (
        <div></div>
      ) : (
        <form onSubmit={onSubmit} className="inline-block w-full overflow-hidden bg-background p-1 text-left align-bottom sm:align-middle">
          <div className="mt-3 text-center sm:mt-5">
            <div className="flex items-baseline space-x-1">
              <h3 className="text-lg font-medium leading-6 text-foreground">Deactivate:</h3>
              <div className="font-medium">{item.name}</div>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="shadow-2xs relative mt-1 rounded-md">
              <input
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                type="text"
                name="reason"
                id="reason"
                required
                className="block w-full rounded-md border-border focus:border-border focus:ring-gray-500 sm:text-sm"
                placeholder={"Reason for deactivation (this will be visible to the user)"}
              />
            </div>
          </div>
          <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className={clsx(
                "shadow-2xs focus:outline-hidden inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm",
                "bg-red-600 hover:bg-red-700 focus:ring-red-500",
                isSubmitting ? "cursor-not-allowed opacity-50" : ""
              )}
            >
              {isSubmitting ? (
                <>
                  <svg className="-ml-1 mr-2 h-4 w-4 animate-spin text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  {t("shared.deactivating", "Deactivating...")}
                </>
              ) : (
                t("shared.deactivate")
              )}
            </button>
            <button
              type="button"
              disabled={isSubmitting}
              onClick={onClose}
              className={clsx(
                "shadow-2xs focus:outline-hidden mt-3 inline-flex w-full justify-center rounded-md border border-border bg-background px-4 py-2 text-base font-medium text-foreground/80 hover:bg-secondary focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 sm:col-start-1 sm:mt-0 sm:text-sm",
                isSubmitting ? "cursor-not-allowed opacity-50" : ""
              )}
            >
              {t("shared.cancel", "Cancel")}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
}
