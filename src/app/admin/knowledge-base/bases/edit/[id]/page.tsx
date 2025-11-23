"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import KnowledgeBaseForm from "@/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { deleteKnowledgeBase, editKnowledgeBase } from "./actions";

type ComponentProps = {
  data: {
    item: KnowledgeBaseDto;
  };
};

export default function Component({ data }: ComponentProps) {
  const router = useRouter();
  const confirmDelete = useRef<RefConfirmModal>(null);
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<{ error?: string; success?: string } | null>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete knowledge base?", "Delete", "Cancel", `Are you sure you want to delete knowledge base "${data.item.title}"?`);
  }

  async function onConfirmedDelete() {
    startTransition(async () => {
      try {
        const result = await deleteKnowledgeBase(data.item.id);
        if (result?.error) {
          setActionData({ error: result.error });
        }
        // If successful, the server action will redirect
      } catch (error) {
        console.error("Error deleting knowledge base:", error);
        setActionData({ error: "An unexpected error occurred" });
      }
    });
  }

  async function handleSubmit(formData: FormData) {
    const result = await editKnowledgeBase(data.item.id, formData);
    if (result?.error) {
      setActionData(result);
    } else {
      // Success - redirect happens in action
      router.push("/admin/knowledge-base/bases");
    }
  }

  function onClose() {
    router.push("/admin/knowledge-base/bases");
  }

  return (
    <>
      <SlideOverFormLayout title="Edit Knowledge Base" description="Update your knowledge base settings" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6">
          <KnowledgeBaseForm item={data.item} onDelete={onDelete} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </SlideOverFormLayout>
      <ActionResultModal actionData={actionData} showSuccess={false} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </>
  );
}
