"use client";

import { useActionState } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import SettingSection from "@/components/ui/sections/SettingSection";

type ActionData = {
  deleteError?: string;
  deleteSuccess?: boolean;
};

async function deleteAllFeatureFlags(prevState: ActionData | null, formData: FormData): Promise<ActionData> {
  const action = formData.get("action");
  if (action === "delete-all") {
    try {
      const response = await fetch("/api/admin/feature-flags/delete-all", {
        method: "POST",
      });
      const data = await response.json();
      if (data.deleteSuccess) {
        return { deleteSuccess: true };
      } else {
        return { deleteError: data.error || "Failed to delete feature flags" };
      }
    } catch (error) {
      return { deleteError: "An error occurred while deleting feature flags" };
    }
  } else {
    return { deleteError: "Invalid form" };
  }
}

export default function AdminAnalyticsOverviewRoute() {
  const { t } = useTranslation();
  const [actionData, formAction, isPending] = useActionState<ActionData | null, FormData>(deleteAllFeatureFlags, null);
  return (
    <>
      <IndexPageLayout>
        <div className="space-y-6 p-4 sm:px-6 lg:col-span-9 lg:px-0">
          <SettingSection title={t("featureFlags.danger.title")} description={t("featureFlags.danger.description")}>
            <div>
              <div className="text-muted-foreground mt-2 max-w-xl text-sm leading-5">
                <p>{t("featureFlags.danger.reset.description")}</p>
              </div>
              <div className="mt-5">
                <form action={formAction}>
                  <input hidden readOnly name="action" value="delete-all" />
                  <ButtonPrimary destructive type="submit" disabled={isPending}>
                    {isPending ? t("shared.loading") : t("featureFlags.danger.reset.title")}
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
                </form>
              </div>
            </div>
          </SettingSection>
        </div>
      </IndexPageLayout>
    </>
  );
}
