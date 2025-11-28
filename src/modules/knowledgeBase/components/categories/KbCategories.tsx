"use client";

import type { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import type { KbCategoryDto } from "@/modules/knowledgeBase/dtos/KbCategoryDto";
import KbCategoriesList from "./KbCategoriesList";
import KbCategoriesGrid from "./KbCategoriesGrid";
import KbCategoriesTopArticles from "./KbCategoriesTopArticles";
import EmptyState from "@/components/ui/emptyState/EmptyState";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { useMounted } from "@/hooks/use-mounted";

export default function KbCategories({ items, kb }: { items: KbCategoryDto[]; kb: KnowledgeBaseDto }) {
  const { t } = useTranslation();
  const mounted = useMounted();
  return (
    <div>
      {items.length === 0 ? (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Categories</h2>
          <EmptyState className="bg-background" captions={{ thereAreNo: "There are no categories" }} />
        </div>
      ) : (
        <Fragment>
          {kb.layout === "list" ? (
            <KbCategoriesList kb={kb} items={items} />
          ) : kb.layout === "articles" ? (
            <KbCategoriesTopArticles kb={kb} items={items} />
          ) : kb.layout === "grid" ? (
            <KbCategoriesGrid kb={kb} items={items} columns={3} />
          ) : kb.layout === "docs" ? (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">{mounted ? t("knowledgeBase.category.plural") : "Categories"}</h2>
              <KbCategoriesGrid kb={kb} items={items} columns={3} />
            </div>
          ) : null}
        </Fragment>
      )}
    </div>
  );
}
