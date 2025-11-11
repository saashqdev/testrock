"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ServerError from "@/components/ui/errors/ServerError";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import KnowledgeBaseForm from "@/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import { createKnowledgeBase } from "./actions";

type ActionData = {
  error?: string;
  success?: string;
};

export default function NewKnowledgeBasePage() {
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const router = useRouter();

  async function handleSubmit(formData: FormData) {
    const result = await createKnowledgeBase(formData);
    if (result?.error) {
      setActionData(result);
    }
  }

  function onDelete() {
    // Handle delete action if needed
  }

  return (
    <div>
      <KnowledgeBaseForm onSubmit={handleSubmit} onDelete={onDelete} />

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
