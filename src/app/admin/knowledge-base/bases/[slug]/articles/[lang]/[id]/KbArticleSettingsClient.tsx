"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import KbArticleSettingsForm from "@/modules/knowledgeBase/components/bases/KbArticleSettingsForm";
import { KnowledgeBaseArticleDto, KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { KnowledgeBaseCategoryDto } from "@/db/models/knowledgeBase/KbCategoriesModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";

interface KbArticleSettingsClientProps {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseArticleWithDetailsDto;
  allKnowledgeBases: { id: string; title: string }[];
  allArticles: KnowledgeBaseArticleDto[];
  allCategories: KnowledgeBaseCategoryDto[];
  slug: string;
  lang: string;
}

export default function KbArticleSettingsClient({
  knowledgeBase,
  item,
  allKnowledgeBases,
  allArticles,
  allCategories,
  slug,
  lang,
}: KbArticleSettingsClientProps) {
  const router = useRouter();
  const confirmDelete = useRef<RefConfirmModal>(null);

  function onDelete() {
    confirmDelete.current?.show("Delete article?", "Delete", "Cancel", `Are you sure you want to delete the article "${item.title}"?`);
  }

  async function onConfirmedDelete() {
    const form = new FormData();
    form.set("action", "delete");
    
    try {
      const response = await fetch(`/api/admin/knowledge-base/bases/${slug}/articles/${lang}/${item.id}`, {
        method: "POST",
        body: form,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        } else {
          router.push(`/admin/knowledge-base/bases/${slug}/articles/${lang}`);
        }
      } else {
        const data = await response.json();
        console.error("Delete failed:", data.error);
      }
    } catch (error) {
      console.error("Error deleting article:", error);
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    try {
      const response = await fetch(`/api/admin/knowledge-base/bases/${slug}/articles/${lang}/${item.id}`, {
        method: "POST",
        body: formData,
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.redirectUrl) {
          router.push(data.redirectUrl);
        }
        router.refresh();
      } else {
        const data = await response.json();
        console.error("Save failed:", data.error);
      }
    } catch (error) {
      console.error("Error saving article:", error);
    }
  }

  return (
    <div>
      <KbArticleSettingsForm
        allKnowledgeBases={allKnowledgeBases}
        allArticles={allArticles}
        allCategories={allCategories}
        item={item}
        onDelete={onDelete}
        onSubmit={handleSubmit}
      />

      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />
    </div>
  );
}
