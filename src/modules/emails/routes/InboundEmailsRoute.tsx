"use client";

import { useRef, useTransition, useState } from "react";
import { useTranslation } from "react-i18next";
import { usePathname } from "next/navigation";
import EmailsTable from "@/components/core/emails/EmailsTable";
import InputFilters from "@/components/ui/input/InputFilters";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { syncEmailsAction } from "../actions/sync-emails.action";
import { LoaderDataEmails } from "../loaders/inbound-emails";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { EmailWithSimpleDetailsDto } from "@/db/models/email/EmailsModel";

interface InboundEmailsRouteProps {
  data: LoaderDataEmails;
  children?: React.ReactNode;
}

export default function InboundEmailsRoute({ data, children }: InboundEmailsRouteProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [syncedItems, setSyncedItems] = useState<EmailWithSimpleDetailsDto[] | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const confirmModal = useRef<RefConfirmModal>(null);

  function confirmedSync() {
    startTransition(async () => {
      setSyncError(null);
      const result = await syncEmailsAction(data.tenantId, pathname);
      
      if (result.error) {
        setSyncError(result.error);
      } else if (result.items) {
        setSyncedItems(result.items);
      }
    });
  }

  return (
    <EditPageLayout
      title={
        <div className="flex flex-col">
          <div>{t("models.email.inboundEmails")}</div>
          <div className="truncate text-xs font-normal">
            <span className="select-all italic">
              {data.error ? (
                <div className="text-red-500">{data.error}</div>
              ) : (
                data.inboundEmailAddress
              )}
            </span>
          </div>
          {syncError && (
            <div className="text-xs text-red-500 mt-1">{syncError}</div>
          )}
        </div>
      }
      buttons={
        <div className="flex items-center space-x-2">
          <button
            onClick={() => confirmModal.current?.show(t("shared.sync"), t("shared.confirm"))}
            disabled={isPending}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? t("shared.syncing") + "..." : t("shared.sync")}
          </button>
          <InputFilters filters={data.filterableProperties} />
        </div>
      }
    >
      <div className="space-y-2">
        <EmailsTable 
          items={syncedItems ?? data.items} 
          withTenant={data.tenantId === null} 
          pagination={data.pagination} 
        />

        <ConfirmModal ref={confirmModal} onYes={confirmedSync} />

        {children}
      </div>
    </EditPageLayout>
  );
}
