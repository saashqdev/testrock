"use client";

import { useRef, useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import KbCategoryForm from "@/modules/knowledgeBase/components/bases/KbCategoryForm";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";

interface KbCategoryClientProps {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseCategoryWithDetailsDto;
  lang: string;
  slug: string;
  onDelete: (categoryId: string, slug: string, lang: string) => Promise<void>;
  onEdit: (
    categoryId: string,
    knowledgeBaseId: string,
    slug: string,
    lang: string,
    formData: {
      slug: string;
      title: string;
      description: string;
      icon: string;
      seoImage: string;
    }
  ) => Promise<void>;
  onSetOrders: (items: { id: string; order: number }[]) => Promise<void>;
}

export default function KbCategoryClient({ knowledgeBase, item, lang, slug, onDelete, onEdit, onSetOrders }: KbCategoryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<{ error?: string; success?: string } | null>(null);
  const confirmDelete = useRef<RefConfirmModal>(null);

  function handleDelete() {
    confirmDelete.current?.show("Delete category?", "Delete", "Cancel", `Are you sure you want to delete category "${item.title}"?`);
  }

  function handleConfirmedDelete() {
    startTransition(async () => {
      try {
        await onDelete(item.id, slug, lang);
      } catch (error) {
        console.error("Error deleting category:", error);
        setActionData({ error: "Failed to delete category" });
      }
    });
  }

  async function handleEdit(formData: FormData) {
    const data = {
      slug: formData.get("slug")?.toString() ?? "",
      title: formData.get("title")?.toString() ?? "",
      description: formData.get("description")?.toString() ?? "",
      icon: formData.get("icon")?.toString() ?? "",
      seoImage: formData.get("seoImage")?.toString() ?? "",
    };

    startTransition(async () => {
      try {
        await onEdit(item.id, knowledgeBase.id, slug, lang, data);
      } catch (error: any) {
        console.error("Error editing category:", error);
        setActionData({ error: error.message || "Failed to update category" });
      }
    });
  }

  async function handleSetOrders(formData: FormData) {
    const items: { id: string; order: number }[] = formData.getAll("orders[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    startTransition(async () => {
      try {
        await onSetOrders(items);
        router.refresh();
      } catch (error) {
        console.error("Error setting orders:", error);
      }
    });
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
