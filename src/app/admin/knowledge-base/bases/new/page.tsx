"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import ServerError from "@/components/ui/errors/ServerError";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import KnowledgeBaseForm from "@/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
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
    } else {
      // Success - navigate back to list
      router.push("/admin/knowledge-base/bases");
    }
  }

  function onClose() {
    router.push("/admin/knowledge-base/bases");
  }

  return (
    <>
      <SlideOverFormLayout
        title="New Knowledge Base"
        description="Create a new knowledge base for your documentation"
        onClosed={onClose}
        className="max-w-2xl"
      >
        <div className="px-4 sm:px-6">
          <KnowledgeBaseForm onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </SlideOverFormLayout>

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
