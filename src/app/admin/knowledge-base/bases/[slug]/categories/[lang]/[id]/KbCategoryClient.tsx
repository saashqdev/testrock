"use client";

import { useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import KbCategoryForm from "@/modules/knowledgeBase/components/bases/KbCategoryForm";
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

export default function KbCategoryClient({
  knowledgeBase,
  item,
  lang,
  slug,
  onDelete,
  onEdit,
  onSetOrders,
}: KbCategoryClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const confirmDelete = useRef<RefConfirmModal>(null);

  function handleDelete() {
    confirmDelete.current?.show(
      "Delete knowledge base?",
      "Delete",
      "Cancel",
      `Are you sure you want to delete knowledge base "${item.title}"?`
    );
  }

  function handleConfirmedDelete() {
    startTransition(async () => {
      try {
        await onDelete(item.id, slug, lang);
      } catch (error) {
        console.error("Error deleting category:", error);
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
      } catch (error) {
        console.error("Error editing category:", error);
        throw error;
      }
    });
  }

  async function handleSetOrders(formData: FormData) {
    const items: { id: string; order: number }[] = formData
      .getAll("orders[]")
      .map((f: FormDataEntryValue) => {
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

  return (
    <div>
      <KbCategoryForm
        knowledgeBase={knowledgeBase}
        language={lang}
        item={item}
        onDelete={handleDelete}
      />
      <ConfirmModal ref={confirmDelete} onYes={handleConfirmedDelete} destructive />
    </div>
  );
}
