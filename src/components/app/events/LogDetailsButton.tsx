"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import Modal from "@/components/ui/modals/Modal";
import { LogWithDetailsDto } from "@/db/models/logs/LogsModel";

export default function LogDetailsButton({ item }: { item: LogWithDetailsDto }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  function stringifyDetails() {
    if (!item.details) {
      return "No details available";
    }
    
    try {
      // If it's already a string that looks like JSON, parse and re-stringify with formatting
      const parsed = typeof item.details === "string" ? JSON.parse(item.details) : item.details;
      return JSON.stringify(parsed, null, 2);
    } catch (e) {
      // If parsing fails, return the raw details
      return item.details.toString();
    }
  }
  return (
    <>
      <div className="flex space-x-2">
        {item.details !== null && (
          <button type="button" onClick={() => setOpen(true)} className="hover:text-foreground italic underline">
            {t("models.log.details")}
          </button>
        )}
      </div>

      <Modal className="sm:max-w-md" open={open} setOpen={setOpen}>
        <div className="flex justify-between space-x-2">
          <div className="text-foreground text-lg font-medium">Details</div>
          <div>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(stringifyDetails() ?? "");
              }}
              className="bg-theme-100 text-theme-700 hover:bg-theme-200 focus:ring-ring inline-flex items-center rounded-md border border-transparent px-3 py-2 text-sm font-medium leading-4 focus:outline-hidden focus:ring-2 focus:ring-offset-2"
            >
              {t("shared.copy")}
            </button>
          </div>
        </div>
        <div className="bg-muted border-border mt-2 max-h-96 overflow-auto rounded-lg border-2 border-dashed p-4">
          <pre className="text-foreground text-xs whitespace-pre-wrap break-all">{stringifyDetails()}</pre>
        </div>
      </Modal>
    </>
  );
}
