"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import ServerError from "@/components/ui/errors/ServerError";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import KbCategoryForm from "@/modules/knowledgeBase/components/bases/KbCategoryForm";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { createKbCategory, getKnowledgeBase } from "./actions";
import { useParams } from "next/navigation";

type ActionData = {
  error?: string;
  success?: string;
};

export default function NewKbCategoryPage() {
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const lang = params.lang as string;

  useEffect(() => {
    async function loadData() {
      const kb = await getKnowledgeBase(slug, new Request(window.location.href));
      setKnowledgeBase(kb);
      setLoading(false);
    }
    loadData();
  }, [slug]);

  async function handleSubmit(formData: FormData) {
    const result = await createKbCategory(slug, lang, formData);
    if (result?.error) {
      setActionData(result);
    } else {
      // Success - navigate back to list
      router.push(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
    }
  }

  function onClose() {
    router.push(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
  }

  if (loading) {
    return (
      <SlideOverFormLayout title="New Category" description="Create a new category" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6 py-8 text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </SlideOverFormLayout>
    );
  }

  if (!knowledgeBase) {
    return (
      <SlideOverFormLayout title="New Category" description="Create a new category" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6 py-8 text-center">
          <div className="text-destructive">Knowledge base not found</div>
        </div>
      </SlideOverFormLayout>
    );
  }

  return (
    <>
      <SlideOverFormLayout title="New Category" description="Create a new category for your knowledge base" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6">
          <KbCategoryForm knowledgeBase={knowledgeBase} language={lang} onSubmit={handleSubmit} onCancel={onClose} />
        </div>
      </SlideOverFormLayout>

      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
