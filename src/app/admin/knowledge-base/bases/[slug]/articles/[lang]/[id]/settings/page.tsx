"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import SlideOverFormLayout from "@/components/ui/slideOvers/SlideOverFormLayout";
import KbArticleSettingsClient from "../KbArticleSettingsClient";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryDto } from "@/db/models/knowledgeBase/KbCategoriesModel";

export default function KbArticleSettingsPage() {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    knowledgeBase: KnowledgeBaseDto;
    item: KnowledgeBaseArticleWithDetailsDto;
    allKnowledgeBases: { id: string; title: string }[];
    allArticles: any[];
    allCategories: KnowledgeBaseCategoryDto[];
  } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(
          `/api/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}/${params.id}/settings`
        );
        if (response.ok) {
          const result = await response.json();
          setData(result);
        } else {
          const errorData = await response.json();
          console.error("API error:", response.status, errorData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [params.slug, params.lang, params.id]);

  function handleClose() {
    router.push(`/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}/${params.id}`);
  }

  if (loading) {
    return (
      <SlideOverFormLayout title="Loading..." description="" onClosed={handleClose} className="max-w-2xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </SlideOverFormLayout>
    );
  }

  if (!data) {
    return (
      <SlideOverFormLayout title="Error" description="" onClosed={handleClose} className="max-w-2xl">
        <div className="flex items-center justify-center p-8">
          <div className="text-red-600">Failed to load article settings</div>
        </div>
      </SlideOverFormLayout>
    );
  }

  return (
    <SlideOverFormLayout title={`Settings: ${data.item.title}`} description="" onClosed={handleClose} className="max-w-2xl">
      <div className="px-5 pt-5">
        <KbArticleSettingsClient
          knowledgeBase={data.knowledgeBase}
          item={data.item}
          allKnowledgeBases={data.allKnowledgeBases}
          allArticles={data.allArticles}
          allCategories={data.allCategories}
          slug={params.slug as string}
          lang={params.lang as string}
        />
      </div>
    </SlideOverFormLayout>
  );
}
