"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import KbCategoryForm from "@/modules/knowledgeBase/components/bases/KbCategoryForm";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import { editCategory, deleteCategory } from "./actions";

interface KbCategoryClientProps {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseCategoryWithDetailsDto;
  lang: string;
  slug: string;
}

export default function KbCategoryClient({ knowledgeBase, item, lang, slug }: KbCategoryClientProps) {
  const router = useRouter();
  const [actionData, setActionData] = useState<{ error?: string; success?: string } | null>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  function handleDelete() {
    confirmDelete.current?.show("Delete category?", "Delete", "Cancel", `Are you sure you want to delete category "${item.title}"?`);
  }

  async function handleConfirmedDelete() {
    const result = await deleteCategory(item.id);
    if (result?.error) {
      setActionData(result);
    } else {
      // Success - navigate back to list
      router.push(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
    }
  }

  async function handleEdit(formData: FormData) {
    const data = {
      slug: formData.get("slug")?.toString() ?? "",
      title: formData.get("title")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      icon: formData.get("icon")?.toString() ?? "",
      seoImage: formData.get("seoImage")?.toString() ?? "",
    };

    const result = await editCategory(item.id, knowledgeBase.id, slug, lang, data);
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

  function onCancel() {
    router.push(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
  }

  return (
    <>
      <SlideOverFormLayout title="Edit Category" description="Update category settings" onClosed={onClose} className="max-w-2xl">
        <div className="px-4 sm:px-6">
          <KbCategoryForm knowledgeBase={knowledgeBase} language={lang} item={item} onDelete={handleDelete} onSubmit={handleEdit} onCancel={onCancel} />
        </div>
      </SlideOverFormLayout>
      <ConfirmModal ref={confirmDelete} onYes={handleConfirmedDelete} destructive />
      <ActionResultModal actionData={actionData ?? undefined} showSuccess={false} />
    </>
  );
}
