"use client";

import { AnalyticsSettings } from "@prisma/client";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SettingSection from "@/components/ui/sections/SettingSection";
import { useRootData } from "@/lib/state/useRootData";
import Tabs from "@/components/ui/tabs/Tabs";
import { deleteAllAnalytics, updateSettings } from "./actions";

type LoaderData = {
  settings: AnalyticsSettings;
  isLocalDev: boolean;
};

type ActionData = {
  deleteError?: string;
  deleteSuccess?: boolean;
  setSettingsSuccess?: boolean;
};

export default function AdminAnalyticsSettingsClient({ settings, isLocalDev }: LoaderData) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  
  const [actionData, setActionData] = useState<ActionData>({});

  const formRef = useRef<HTMLFormElement>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  const [typeToConfirm, setTypeToConfirm] = useState<string>(isLocalDev ? "delete all analytics data" : "");
  const [isPublic, setIsPublic] = useState(settings.public);

  useEffect(() => {
    if (!isPending) {
      formRef.current?.reset();
    }
  }, [isPending]);

  function removeIgnoredPage(item: string) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("action", "remove-ignored-page");
      formData.set("ignored-page", item);
      await updateSettings(formData);
      router.refresh();
    });
  }

  function onDelete() {
    confirmDelete.current?.show(t("shared.delete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function onDeleteConfirm() {
    startTransition(async () => {
      const result = await deleteAllAnalytics();
      setActionData(result);
      router.refresh();
    });
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updateSettings(formData);
      setActionData(result);
      router.refresh();
    });
  }

  const rootData = useRootData();
  const textToType = `delete all analytics data`;
  return (
    <>
      <EditPageLayout>
        <div className="flex justify-between gap-2">
          <Tabs
            tabs={[
              { name: t("analytics.overview"), routePath: "/admin/analytics/overview" },
              { name: t("analytics.uniqueVisitors"), routePath: "/admin/analytics/visitors" },
              { name: t("analytics.pageViews"), routePath: "/admin/analytics/page-views" },
              { name: t("analytics.events"), routePath: "/admin/analytics/events" },
              { name: t("analytics.settings"), routePath: "/admin/analytics/settings" },
            ]}
            className="grow"
          />
        </div>

        <div className="space-y-6 p-4 sm:px-6 lg:col-span-9 lg:px-0">
          <SettingSection title="Preferences" description="Set your analytics preferences.">
            <form ref={formRef} onSubmit={handleSubmit}>
              <input hidden readOnly name="action" value="set-settings" />
              <div className="space-y-2">
                <InputCheckboxWithDescription
                  name="public"
                  title={t("shared.public")}
                  description={
                    <div className="text-muted-foreground">
                      Share your stats on a public URL at{" "}
                      <a className="underline" target="_blank" rel="noreferrer" href={rootData.serverUrl + "/analytics"}>
                        {rootData.serverUrl + "/analytics"}
                      </a>
                    </div>
                  }
                  value={isPublic}
                  onChange={setIsPublic}
                />
                <div className="space-y-2">
                  <div className="text-muted-foreground text-sm font-medium">Ingored pages</div>
                  <div className="border-border bg-secondary space-y-1 rounded-md border p-3">
                    {settings.ignorePages.length === 0 && <div className="text-muted-foreground text-xs">There are no ignored pages.</div>}
                    {settings.ignorePages
                      .split(",")
                      .filter((f) => f)
                      .map((item) => {
                        return (
                          <div key={item} className="text-muted-foreground border-border group flex space-x-2 border-b text-xs">
                            <div>{item}</div>
                            <button type="button" className="hidden text-xs text-red-500 underline group-hover:block" onClick={() => removeIgnoredPage(item)}>
                              {t("shared.remove")}
                            </button>
                          </div>
                        );
                      })}
                  </div>
                  <InputText name="ignore-page" title="Add ignored page" defaultValue="" />
                </div>
                <div className="border-border mt-3 flex items-center justify-end space-x-2 border-t pt-3">
                  <LoadingButton type="submit" disabled={isPending}>
                    {t("shared.save")}
                  </LoadingButton>
                </div>
              </div>
            </form>
          </SettingSection>

          <SettingSection title={t("analytics.danger.title")} description={t("analytics.danger.description")}>
            <div>
              <div className="text-muted-foreground mt-2 max-w-xl text-sm leading-5">
                <p>{t("analytics.danger.reset.description")}</p>
              </div>
              <div className="mt-5 space-y-2">
                <div>
                  <InputText title={`Type "${textToType}" to confirm`} value={typeToConfirm} setValue={setTypeToConfirm} />
                </div>
                <div>
                  <ButtonPrimary disabled={typeToConfirm !== textToType} destructive={true} onClick={onDelete}>
                    {t("analytics.danger.reset.title")}
                  </ButtonPrimary>

                  {actionData?.deleteSuccess ? (
                    <p className="py-2 text-xs text-green-500" role="alert">
                      {t("analytics.deleted")}
                    </p>
                  ) : null}

                  {actionData?.deleteError ? (
                    <p className="py-2 text-xs text-rose-500" role="alert">
                      {actionData.deleteError}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </SettingSection>
        </div>

        <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirm} destructive />
      </EditPageLayout>
    </>
  );
}
