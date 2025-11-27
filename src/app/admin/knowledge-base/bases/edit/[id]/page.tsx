"use client";

import { useRef, useState, useTransition, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import KnowledgeBaseForm from "@/modules/knowledgeBase/components/bases/KnowledgeBaseForm";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { KnowledgeBaseWithDetailsDto } from "@/db/models/knowledgeBase/KnowledgeBaseModel";
import { deleteKnowledgeBase, editKnowledgeBase, getKnowledgeBase } from "./actions";
import ServerError from "@/components/ui/errors/ServerError";

export default function EditKnowledgeBasePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const confirmDelete = useRef<RefConfirmModal>(null);
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<{ error?: string; success?: string } | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseWithDetailsDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      const kb = await getKnowledgeBase(id);
      setKnowledgeBase(kb);
      setLoading(false);
    }
    loadData();
  }, [id]);

  function onDelete() {
    if (!knowledgeBase) return;
    confirmDelete.current?.show("Delete knowledge base?", "Delete", "Cancel", `Are you sure you want to delete knowledge base "${knowledgeBase.title}"?`);
  }

  async function onConfirmedDelete() {
    if (!knowledgeBase) return;
    startTransition(async () => {
      try {
        const result = await deleteKnowledgeBase(knowledgeBase.id);
        if (result?.error) {
          setActionData({ error: result.error });
        } else {
          // Success - navigate back to list
          router.push("/admin/knowledge-base/bases");
        }
      } catch (error) {
        console.error("Error deleting knowledge base:", error);
        setActionData({ error: "An unexpected error occurred" });
      }
    });
  }

  async function handleSubmit(formData: FormData) {
    if (!knowledgeBase) return;
    const result = await editKnowledgeBase(knowledgeBase.id, formData);
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

  if (loading) {
    return (
      <SlideOverFormLayout title="Edit Knowledge Base" description="Update your knowledge base settings" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6 py-8 text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </SlideOverFormLayout>
    );
  }

  if (!knowledgeBase) {
    return (
      <SlideOverFormLayout title="Edit Knowledge Base" description="Update your knowledge base settings" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6 py-8 text-center">
          <div className="text-destructive">Knowledge base not found</div>
        </div>
      </SlideOverFormLayout>
    );
  }

  return (
    <>
      <SlideOverFormLayout title="Edit Knowledge Base" description="Update your knowledge base settings" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6">
          <KnowledgeBaseForm item={knowledgeBase} onDelete={onDelete} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </SlideOverFormLayout>
      <ActionResultModal actionData={actionData} showSuccess={false} />
      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
