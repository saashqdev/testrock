"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { WorkflowsDangerApi } from "./danger.api.server";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import DropdownOptions from "@/components/ui/dropdowns/DropdownOptions";
import { Menu } from "@headlessui/react";
import clsx from "clsx";

interface WorkflowsDangerViewProps {
  data: WorkflowsDangerApi.LoaderData & {
    handleAction?: (formData: FormData) => Promise<void>;
    isPending?: boolean;
  };
}

export default function WorkflowsDangerView({ data }: WorkflowsDangerViewProps) {
  const [actionResult, setActionResult] = useState<WorkflowsDangerApi.ActionData | null>(null);

  const confirmReset = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionResult?.error) {
      toast.error(actionResult.error);
    } else if (actionResult?.success) {
      toast.success(actionResult.success);
    }
  }, [actionResult]);

  function onReset(type: string) {
    confirmReset.current?.setValue(type);
    if (type === "reset-all-data") {
      confirmReset.current?.show("Reset data", "Reset", "Cancel", "All workflows, executions, credentials and variables will be deleted.");
    } else if (type === "delete-all-executions") {
      confirmReset.current?.show("Delete all executions", "Delete", "Cancel", "All executions will be deleted.");
    } else if (type === "delete-all-variables") {
      confirmReset.current?.show("Delete all variables", "Delete", "Cancel", "All variables will be deleted.");
    } else if (type === "delete-all-credentials") {
      confirmReset.current?.show("Delete all credentials", "Delete", "Cancel", "All credentials will be deleted.");
    } else if (type === "delete-all-workflows") {
      confirmReset.current?.show("Delete all workflows", "Delete", "Cancel", "All workflows will be deleted.");
    }
  }

  async function onResetConfirm(type: string) {
    if (data.handleAction) {
      const formData = new FormData();
      formData.set("action", type);
      await data.handleAction(formData);
    } else {
      // Fallback for direct usage without server action
      try {
        const formData = new FormData();
        formData.set("action", type);

        const response = await fetch("/api/admin/workflows/workflow-engine/danger", {
          method: "POST",
          body: formData,
        });

        const result = await response.json();
        setActionResult(result);

        // Refresh the page data after successful action
        if (result.success) {
          window.location.reload();
        }
      } catch (error) {
        console.error("Error performing action:", error);
        setActionResult({ error: "An error occurred while performing the action." });
      }
    }
  }

  return (
    <div className="h-screen flex-1 overflow-x-auto xl:overflow-y-auto">
      <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 lg:py-12">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Danger</h1>

        <div className="divide-y-gray-200 mt-6 space-y-8 divide-y">
          <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
            <div className="sm:col-span-6">
              <h2 className="text-xl font-medium text-foreground">Reset all data</h2>
              <p className="mt-1 text-sm text-muted-foreground">Delete all workflows data.</p>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-8">
            <DropdownOptions
              width="w-80"
              button={
                <div className="rounded-md border border-border bg-background px-2 py-2 text-sm font-medium text-red-600 hover:bg-secondary">Reset data</div>
              }
              options={
                <div>
                  {[
                    {
                      action: "delete-all-credentials",
                      title: `Delete all credentials (${data.summary.credentials})`,
                    },
                    {
                      action: "delete-all-variables",
                      title: `Delete all variables (${data.summary.variables})`,
                    },
                    {
                      action: "delete-all-executions",
                      title: `Delete all executions (${data.summary.executions})`,
                    },
                    {
                      action: "delete-all-workflows",
                      title: `Delete all workflows (${data.summary.workflows})`,
                    },
                    {
                      action: "reset-all-data",
                      title: "Reset all data",
                      className: "text-red-600 font-medium",
                    },
                  ].map((option) => {
                    return (
                      <Menu.Item key={option.action}>
                        {({ active }) => (
                          <button
                            type="button"
                            onClick={() => onReset(option.action)}
                            className={clsx(
                              option.className,
                              "w-full truncate text-left",
                              active ? "bg-secondary/90 text-foreground" : "text-foreground/80",
                              "block px-4 py-2 text-sm"
                            )}
                          >
                            {option.title}
                          </button>
                        )}
                      </Menu.Item>
                    );
                  })}
                </div>
              }
            ></DropdownOptions>
          </div>
        </div>
      </div>

      <ConfirmModal ref={confirmReset} onYes={onResetConfirm} destructive />
    </div>
  );
}
