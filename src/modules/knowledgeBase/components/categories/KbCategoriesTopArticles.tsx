"use client";

import Link from "next/link";
import clsx from "clsx";
import type { KbCategoryDto } from "../../dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "../../dtos/KnowledgeBaseDto";
import ColorTextUtils from "@/lib/shared/colors/ColorTextUtils";
import ColorGroupHoverUtils from "@/lib/shared/colors/ColorGroupHoverUtils";
import Image from "next/image";

export default function KbCategoriesTopArticles({ kb, items }: { kb: KnowledgeBaseDto; items: KbCategoryDto[] }) {
  function getTopArticles(item: KbCategoryDto) {
    return item.articles.slice(0, 3);
  }
  return (
    <div className="space-y-4">
      {items.map((item) => {
        return (
          <div key={item.slug} className="space-y-4">
            <div className="flex items-baseline justify-between space-x-2">
              <div className="flex items-center space-x-4">
                {item.icon.startsWith("<svg") ? (
                  <div
                    dangerouslySetInnerHTML={{
                      __html:
                        item.icon.replace(
                          "<svg",
                          `<svg class='${clsx("h-6 w-6", ColorTextUtils.getText500(kb.color), ColorGroupHoverUtils.getText700(kb.color))}'`
                        ) ?? "",
                    }}
                  />
                ) : item.icon.includes("http") ? (
                  <Image className="h-6 w-6" src={item.icon} alt={item.title} />
                ) : null}
                <Link href={item.href} className="hover:underline">
                  <h2 className="text-2xl font-bold">{item.title}</h2>
                </Link>
              </div>
              <Link href={item.href} className="text-sm text-muted-foreground hover:underline">
                View all
              </Link>
            </div>
            <div className={clsx("grid grid-cols-3 gap-4")}>
              {getTopArticles(item).map((item) => {
                return (
                  <div key={item.title} className="group rounded-md border border-border bg-background hover:border-secondary-foreground hover:bg-secondary">
                    <Link href={item.href} className="w-full">
                      <div className="flex items-center space-x-8 p-6">
                        <div className="flex w-full flex-col space-y-1">
                          <div className="font-medium group-hover:text-foreground/80">{item.title}</div>
                          <div className="text-sm text-muted-foreground">{item.description}</div>
                        </div>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
