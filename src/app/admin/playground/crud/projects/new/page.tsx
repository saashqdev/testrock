"use client";

import { useTranslation } from "react-i18next";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import FakeProjectForm from "@/modules/fake/fakeProjectsCrud/components/FakeProjectForm";
import { createFakeProject } from "../actions";

export default function NewFakeProjectPage() {
  const { t } = useTranslation();

  return (
    <NewPageLayout
      title="Create Fake Project"
      menu={[
        {
          title: "Fake Projects",
          routePath: "/admin/playground/crud/projects",
        },
        {
          title: t("shared.create"),
          routePath: "/admin/playground/crud/projects/new",
        },
      ]}
    >
      <div className="mx-auto max-w-2xl">
        <FakeProjectForm action={createFakeProject} />
      </div>
    </NewPageLayout>
  );
}
