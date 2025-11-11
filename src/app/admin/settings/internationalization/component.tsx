"use client";

import { useTranslation } from "react-i18next";
import UnderConstruction from "@/components/ui/misc/UnderConstruction";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import BackButtonWithTitle from "@/components/ui/buttons/BackButtonWithTitle";

export default function AdminSettingsInternationalization() {
  const { t, i18n } = useTranslation();

  return (
    <EditPageLayout title={<BackButtonWithTitle href="/admin/settings">{t("settings.admin.internationalization.title")}</BackButtonWithTitle>}>
      <div>
        <UnderConstruction title="TODO: Internationalization (Save custom translations on the database?)" />

        <form method="post" className="divide-y-gray-200 space-y-8 divide-y">
          <input name="action" value="update" hidden readOnly />

          {JSON.stringify(i18n)}
        </form>
      </div>
    </EditPageLayout>
  );
}
