"use client";

import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { useTranslation } from "react-i18next";
import { useState, useEffect } from "react";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import DateCell from "@/components/ui/dates/DateCell";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import InputCheckbox from "@/components/ui/input/InputCheckbox";
import InputFilters from "@/components/ui/input/InputFilters";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import TableSimple from "@/components/ui/tables/TableSimple";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel"; 
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import NumberUtils from "@/lib/shared/NumberUtils";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { Menu } from "@headlessui/react";
import clsx from "clsx";

type LoaderData = {
  knowledgeBases: KnowledgeBaseDto[];
  items: KnowledgeBaseArticleWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function ArticlesPage() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();

  const [data, setData] = useState<LoaderData>({
    knowledgeBases: [],
    items: [],
    pagination: { page: 1, pageSize: 10, totalItems: 0, totalPages: 0 },
    filterableProperties: [],
  });
  const [actionData, setActionData] = useState<ActionData | undefined>();
  const [isLoading, setIsLoading] = useState(true);

  // Fetch data on mount and when URL changes
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/admin/knowledge-base/articles");
      if (response.ok) {
        const result = await response.json();
        setData(result);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const submit = async (formData: FormData, options?: { method: string }) => {
    try {
      const response = await fetch("/api/admin/knowledge-base/articles", {
        method: options?.method || "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setActionData({ error: result.error || "An error occurred" });
        return;
      }

      // Handle redirect
      if (result.redirect) {
        router.push(result.redirect);
        return;
      }

      // Handle success
      if (result.success || result.updated) {
        setActionData({ success: result.success || "Updated successfully" });
        fetchData(); // Refresh data
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setActionData({ error: "An error occurred" });
    }
  };

  function onToggle(item: KnowledgeBaseArticleWithDetailsDto, isFeatured: boolean) {
    const form = new FormData();
    form.set("action", "toggle");
    form.set("isFeatured", isFeatured ? "true" : "false");
    form.set("id", item.id.toString());
    submit(form, {
      method: "post",
    });
  }

  if (isLoading) {
    return (
      <EditPageLayout
        title="Articles"
        withHome={false}
        menu={[{ title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" }, { title: "Articles" }]}
      >
        <div className="flex items-center justify-center py-12">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </EditPageLayout>
    );
  }

  return (
    <EditPageLayout
      title={`Articles (${data.pagination.totalItems})`}
      withHome={false}
      menu={[{ title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" }, { title: "Articles" }]}
      buttons={
        <>
          <InputFilters filters={data.filterableProperties} />
          <Dropdown
            right={false}
            // onClick={() => alert("Dropdown click")}
            button={
              <div className="flex items-center space-x-2">
                <div>{t("knowledgeBase.article.new")}</div>
                <PlusIcon className="h-5 w-5" />
              </div>
            }
            btnClassName={clsx(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              "bg-primary text-primary-foreground shadow-xs hover:bg-primary/90",
              "h-9 px-4 py-2"
            )}
            disabled={data.knowledgeBases.length === 0}
            options={
              <div className="h-64 overflow-auto">
                {data.knowledgeBases.map((kb) => {
                  return (
                    <Menu.Item key={kb.id}>
                      {({ active }) => (
                        <button
                          type="button"
                          onClick={() => {
                            const form = new FormData();
                            form.set("action", "new");
                            form.set("kbId", kb.id.toString());
                            submit(form, {
                              method: "post",
                            });
                          }}
                          className={clsx("w-full text-left", active ? "text-foreground bg-secondary/90" : "text-foreground/80", "block px-4 py-2 text-sm")}
                        >
                          {kb.title}
                        </button>
                      )}
                    </Menu.Item>
                  );
                })}
              </div>
            }
          ></Dropdown>
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
              onClickRoute: (_, item) => `/admin/knowledge-base/bases/${item.language}/articles/${KnowledgeBaseUtils.defaultLanguage}/${item.id}/settings`,
            },
            {
              title: "Edit",
              onClickRoute: (_, item) => `/admin/knowledge-base/bases/${item.language}/articles/${KnowledgeBaseUtils.defaultLanguage}/${item.id}/edit`,
            },
          ]}
          headers={[
            {
              title: t("knowledgeBase.title"),
              value: (i) => i.knowledgeBase.title,
            },

            // {
            //   name: "language",
            //   title: "Language",
            //   value: (i) => KnowledgeBaseUtils.getLanguageName(i.language),
            // },
            {
              name: "title",
              title: "Title",
              className: "w-full",
              value: (i) => (
                <div className="space-y-1">
                  <Link
                    href={`/admin/knowledge-base/bases/${i.knowledgeBase.slug}/articles/${i.language}/${i.id}`}
                    className="flex items-center space-x-2 font-medium hover:underline"
                  >
                    <div>{!i.publishedAt ? <ColorBadge size="sm" color={Colors.GRAY} /> : <ColorBadge size="sm" color={Colors.TEAL} />}</div>
                    <div>{i.title}</div>
                  </Link>
                  {/* <div className="text-muted-foreground text-sm">{i.description}</div> */}
                  {/* <div className="text-sm text-muted-foreground">{i.slug}</div>
                  <div className="text-muted-foreground text-sm">{i.description}</div> */}
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
              title: t("shared.language"),
              value: (i) => i.language,
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
                return <InputCheckbox asToggle value={i.featuredOrder ? true : false} setValue={(checked) => onToggle(i, Boolean(checked))} />;
              },
            },
            {
              name: "createdBy",
              title: t("shared.createdBy"),
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

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </EditPageLayout>
  );
}
