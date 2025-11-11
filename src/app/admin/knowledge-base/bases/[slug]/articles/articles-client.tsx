"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import DateCell from "@/components/ui/dates/DateCell";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import InputCheckbox from "@/components/ui/input/InputCheckbox";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "@/components/ui/tables/TableSimple";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import NumberUtils from "@/lib/shared/NumberUtils";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { useTransition } from "react";

interface ArticlesClientProps {
  data: {
    knowledgeBase: KnowledgeBaseDto;
    items: KnowledgeBaseArticleWithDetailsDto[];
    pagination: PaginationDto;
    filterableProperties: FilterablePropertyDto[];
  };
  params: any;
  onNewArticle: () => Promise<void>;
  onDuplicate: (articleId: string) => Promise<void>;
  onToggleFeatured: (itemId: string, isFeatured: boolean) => Promise<void>;
}

export default function ArticlesClient({ data, params, onNewArticle, onDuplicate, onToggleFeatured }: ArticlesClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleDuplicate(item: KnowledgeBaseArticleWithDetailsDto) {
    startTransition(async () => {
      await onDuplicate(item.id);
    });
  }

  function handleToggle(item: KnowledgeBaseArticleWithDetailsDto, isFeatured: boolean) {
    startTransition(async () => {
      await onToggleFeatured(item.id, isFeatured);
      router.refresh();
    });
  }

  function handleNewArticle() {
    startTransition(async () => {
      await onNewArticle();
    });
  }

  return (
    <EditPageLayout
      title={`Articles (${KnowledgeBaseUtils.getLanguageName(params.lang!)})`}
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Articles", routePath: `/admin/knowledge-base/bases/${params.slug}/articles` },
        { title: params.lang!, routePath: `/admin/knowledge-base/bases/${params.slug}/articles/${params.lang}` },
      ]}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
          <ButtonPrimary onClick={handleNewArticle} disabled={isPending}>
            <div>New</div>
            <PlusIcon className="h-5 w-5" />
          </ButtonPrimary>
        </>
      }
    >
      <div className="space-y-2">
        <TableSimple
          items={data.items}
          pagination={data.pagination}
          actions={[
            {
              title: "Settings",
              onClickRoute: (_, item) => `${item.id}/settings`,
            },
            {
              title: "Duplicate",
              onClick: (_, item) => handleDuplicate(item),
            },
            {
              title: "Edit",
              onClickRoute: (_, item) => `${item.id}`,
            },
          ]}
          headers={[
            {
              name: "status",
              title: "Status",
              value: (i) => (
                <div>{!i.publishedAt ? <SimpleBadge title="Draft" color={Colors.GRAY} /> : <SimpleBadge title="Published" color={Colors.TEAL} />}</div>
              ),
            },
            {
              name: "title",
              title: "Title",
              className: "w-full",
              value: (i) => (
                <div className="space-y-1">
                  <Link href={i.id} className="font-medium hover:underline">
                    {i.title}
                  </Link>
                </div>
              ),
            },
            {
              name: "category",
              title: "Category",
              value: (i) => (
                <div>
                  {i.category ? (
                    <div className="flex flex-col">
                      <div>{i.category.title}</div>
                      {i.section && <div className="text-muted-foreground text-xs">{i.section.title}</div>}
                    </div>
                  ) : (
                    <Link href={`${i.id}/settings`} className="text-muted-foreground text-xs italic hover:underline">
                      No category
                    </Link>
                  )}
                </div>
              ),
            },
            {
              name: "characters",
              title: "Characters",
              value: (i) => NumberUtils.intFormat(i.contentPublishedAsText.length),
            },
            {
              name: "views",
              title: "Views",
              value: (i) => i._count.views,
            },
            {
              name: "upvotes",
              title: "Upvotes",
              value: (i) => i._count.upvotes,
            },
            {
              name: "downvotes",
              title: "Downvotes",
              value: (i) => i._count.downvotes,
            },
            {
              name: "featured",
              title: "Featured",
              value: (i) => {
                return <InputCheckbox asToggle value={i.featuredOrder ? true : false} setValue={(checked) => handleToggle(i, Boolean(checked))} />;
              },
            },
            {
              name: "createdAt",
              title: t("shared.createdAt"),
              value: (i) => (
                <div className="flex flex-col">
                  <DateCell date={i.createdAt} displays={["ymd"]} />
                  <div>
                    {i.createdByUser ? (
                      <div>
                        {i.createdByUser.firstName} {i.createdByUser.lastName}
                      </div>
                    ) : (
                      <div className="text-muted-foreground text-xs italic hover:underline">No author</div>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>

      <SlideOverWideEmpty
        title={"Article settings"}
        open={false}
        onClose={() => {
          router.replace(".");
        }}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4"></div>
        </div>
      </SlideOverWideEmpty>
    </EditPageLayout>
  );
}
