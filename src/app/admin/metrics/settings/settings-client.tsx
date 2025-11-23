"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import InputMultiText from "@/components/ui/input/InputMultiText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";

type LoaderData = {
  totalMetricLogs: number;
  appConfiguration: AppConfigurationDto;
};

type ActionData = {
  error?: string;
  success?: string;
};

type Props = {
  initialData: LoaderData;
};

export function MetricsSettingsClient({ initialData }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();

  const confirmModalDelete = useRef<RefConfirmModal>(null);

  const [data, setData] = useState<LoaderData>(initialData);
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [enabled, setEnabled] = useState<boolean>(initialData.appConfiguration.metrics.enabled);
  const [logToConsole, setLogToConsole] = useState<boolean>(initialData.appConfiguration.metrics.logToConsole);
  const [saveToDatabase, setSaveToDatabase] = useState<boolean>(initialData.appConfiguration.metrics.saveToDatabase);
  const [ignoredUrls, setIgnoredUrls] = useState<string[]>(initialData.appConfiguration.metrics.ignoreUrls.sort());

  useEffect(() => {
    setEnabled(data.appConfiguration.metrics.enabled);
    setLogToConsole(data.appConfiguration.metrics.logToConsole);
    setSaveToDatabase(data.appConfiguration.metrics.saveToDatabase);
    setIgnoredUrls(data.appConfiguration.metrics.ignoreUrls.sort());
  }, [data]);

  function canUpdate() {
    return !isSubmitting && getUserHasPermission(appOrAdminData, "admin.metrics.update");
  }
  function canDelete() {
    return getUserHasPermission(appOrAdminData, "admin.metrics.delete") && data.totalMetricLogs > 0;
  }
  function onDelete() {
    confirmModalDelete.current?.show("Delete metric logs", "Delete", "Cancel", "Are you sure you want to delete all metric logs?");
  }

  async function onConfirmedDelete() {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/metrics/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "delete" }),
      });

      const result = await response.json();

      if (response.ok) {
        setActionData({ success: result.success });
        router.refresh();
      } else {
        setActionData({ error: result.error });
      }
    } catch (error) {
      setActionData({ error: "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: any = {
        action: "set-settings",
        enabled: enabled,
        logToConsole: logToConsole,
        saveToDatabase: saveToDatabase,
        ignoreUrls: ignoredUrls.map((url, idx) => JSON.stringify({ order: idx, value: url })),
      };

      const response = await fetch("/api/admin/metrics/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok) {
        setActionData({ success: "Settings saved successfully" });
        router.refresh();
      } else {
        setActionData({ error: result.error });
      }
    } catch (error) {
      setActionData({ error: "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  }
  return (
    <EditPageLayout
      tabs={[
        {
          name: "Summary",
          routePath: "/admin/metrics/summary",
        },
        {
          name: "All logs",
          routePath: "/admin/metrics/logs",
        },
        {
          name: "Settings",
          routePath: "/admin/metrics/settings",
        },
      ]}
    >
      <form onSubmit={handleSubmit} className="space-y-2 px-3">
        <input name="action" value="set-settings" hidden readOnly />
        <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-6 sm:gap-x-6">
          <div className="sm:col-span-6">
            <InputCheckboxWithDescription
              name="enabled"
              value={enabled}
              title="Enabled"
              description="Metrics are enabled"
              disabled={!canUpdate()}
              onChange={(e) => setEnabled(e)}
            />
            <InputCheckboxWithDescription
              name="logToConsole"
              value={logToConsole}
              title="Log to console"
              description="Log metrics to console"
              disabled={!canUpdate()}
              onChange={(e) => setLogToConsole(e)}
            />
            <InputCheckboxWithDescription
              name="saveToDatabase"
              value={saveToDatabase}
              title="Save to database"
              description="Save metrics to database"
              disabled={!canUpdate()}
              onChange={(e) => setSaveToDatabase(e)}
            />
            <InputMultiText
              name="ignoreUrls"
              title="Ignored URLs"
              value={ignoredUrls.map((f, idx) => {
                return {
                  order: idx,
                  value: f,
                };
              })}
              disabled={!canUpdate()}
            />
          </div>
        </div>
        <div className="flex justify-between space-x-2 border-t border-border pt-3">
          <ButtonTertiary destructive disabled={!canDelete() || isSubmitting} onClick={onDelete}>
            {t("shared.delete")} {data.totalMetricLogs} logs
          </ButtonTertiary>
          <div className="flex items-center space-x-2">
            <LoadingButton type="submit" disabled={!canUpdate()}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
        <ActionResultModal actionData={actionData} showSuccess={false} />
        <ConfirmModal ref={confirmModalDelete} onYes={onConfirmedDelete} />
      </form>
    </EditPageLayout>
  );
}
