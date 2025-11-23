"use client";

import { useActionState } from "react";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import EntityForm from "@/components/entities/EntityForm";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import { createEntityAction } from "./actions";

type ActionData = {
  error?: string;
  success?: string;
};

export default function NewEntityPage() {
  const [actionData, formAction] = useActionState<ActionData | null, FormData>(createEntityAction, null);

  return (
    <>
      <NewPageLayout
        title="Create Entity"
        menu={[
          { title: "Entities", routePath: "/admin/entities" },
          { title: "New", routePath: "/admin/entities/new" },
        ]}
      >
        <EntityForm onSubmit={formAction} />
      </NewPageLayout>
      <ActionResultModal actionData={actionData} />
    </>
  );
}
