"use client";

import { usePathname, useRouter, useParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useRef, useState, useTransition } from "react";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import DocumentDuplicateIconFilled from "@/components/ui/icons/DocumentDuplicateIconFilled";
import PencilIcon from "@/components/ui/icons/PencilIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TrashIcon from "@/components/ui/icons/TrashIcon";
import FolderIconFilled from "@/components/ui/icons/entities/FolderIconFilled";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import DraggableList from "@/components/ui/sort/DraggableList";
import OrderListButtons from "@/components/ui/sort/OrderListButtons";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseCategoryWithDetailsDto[];
};

type ActionData = {
  error?: string;
};

type CategoriesClientProps = {
  data: LoaderData;
  actionData?: ActionData;
  onDeleteCategory: (id: string) => Promise<void>;
  onDeleteSection: (id: string) => Promise<void>;
  onDeleteArticle: (id: string) => Promise<void>;
  onDuplicate: (id: string) => Promise<void>;
  onNewArticle: (categoryId: string, sectionId: string | undefined, position: "first" | "last") => Promise<void>;
  onUpdateArticleTitle: (id: string, title: string) => Promise<void>;
};

export default function CategoriesClient({
  data,
  actionData,
  onDeleteCategory,
  onDeleteSection,
  onDeleteArticle,
  onDuplicate,
  onNewArticle,
  onUpdateArticleTitle,
}: CategoriesClientProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [toggledCategories, setToggledCategories] = useState<string[]>([]);

  const confirmDeleteCategory = useRef<RefConfirmModal>(null);
  const confirmDeleteSection = useRef<RefConfirmModal>(null);
  const confirmDeleteArticle = useRef<RefConfirmModal>(null);

  function onDelete(item: KnowledgeBaseCategoryWithDetailsDto) {
    confirmDeleteCategory.current?.setValue(item);
    confirmDeleteCategory.current?.show("Delete category?", "Delete", "Cancel", `Are you sure you want to delete the category "${item.title}"?`);
  }

  function onConfirmedDeleteCategory(item: KnowledgeBaseCategoryWithDetailsDto) {
    startTransition(async () => {
      await onDeleteCategory(item.id);
    });
  }

  function handleDeleteSection(item: { id: string; title: string }) {
    confirmDeleteSection.current?.setValue(item);
    confirmDeleteSection.current?.show("Delete section", "Delete", "Cancel", `Are you sure you want to delete the section "${item.title}"?`);
  }

  function onConfirmedDeleteSection(item: { id: string; title: string }) {
    startTransition(async () => {
      await onDeleteSection(item.id);
    });
  }

  function handleDuplicate(item: KnowledgeBaseCategoryWithDetailsDto) {
    startTransition(async () => {
      await onDuplicate(item.id);
    });
  }

  function handleNewArticle(categoryId: string, sectionId: string | undefined, position: "first" | "last") {
    startTransition(async () => {
      await onNewArticle(categoryId, sectionId, position);
    });
  }

  function handleDeleteArticle(item: { id: string; title: string }) {
    confirmDeleteArticle.current?.setValue(item);
    confirmDeleteArticle.current?.show("Delete article", "Delete", "Cancel", `Are you sure you want to delete the article "${item.title}"?`);
  }

  function onConfirmedDeleteArticle(item: { id: string; title: string }) {
    startTransition(async () => {
      await onDeleteArticle(item.id);
    });
  }

  function handleUpdateArticleTitle(article: { id: string; title: string }) {
    startTransition(async () => {
      await onUpdateArticleTitle(article.id, article.title);
    });
  }

  return (
    <EditPageLayout
      title={`Categories (${KnowledgeBaseUtils.getLanguageName(params.lang as string)})`}
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Categories", routePath: `/admin/knowledge-base/bases/${params.slug}/categories` },
        { title: params.lang as string, routePath: `/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}` },
      ]}
    >
      <div className="space-y-2">
        {data.items.map((item, idx) => {
          return (
            <div key={idx} className="space-y-2">
              <div className="shadow-2xs rounded-md border border-border bg-background px-4 py-0.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="hidden shrink-0 sm:flex">
                          <OrderListButtons index={idx} items={data.items} editable={true} />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-foreground">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-2">
                                <div>
                                  {item.title}
                                  {item.sections.length > 0 && (
                                    <span className="ml-1 truncate text-xs">
                                      ({item.sections.length === 1 ? "1 section" : `${item.sections.length} sections`})
                                    </span>
                                  )}
                                </div>
                                <div>•</div>
                                {item.articles.filter((f) => f.publishedAt).length > 0 ? (
                                  <div className="truncate text-xs text-muted-foreground">
                                    {item.articles.filter((f) => f.publishedAt).length}{" "}
                                    {item.articles.filter((f) => f.publishedAt).length === 1 ? "article" : "articles"}
                                  </div>
                                ) : (
                                  <div className="truncate text-xs text-muted-foreground">No articles</div>
                                )}
                              </div>
                              <div className="text-xs text-muted-foreground">{item.description}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <DeleteButton onDelete={() => onDelete(item)} canDelete={item.articles.length === 0} />
                        <button
                          type="button"
                          onClick={() => {
                            setToggledCategories((prev) => {
                              if (prev.includes(item.id)) {
                                return prev.filter((f) => f !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <FolderIconFilled className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                        </button>
                        <Link
                          href={item.id}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => handleDuplicate(item)}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <DocumentDuplicateIconFilled className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleNewArticle(item.id, undefined, "first")}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PlusIcon className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {toggledCategories.includes(item.id) && (
                  <CategorySections
                    kb={data.knowledgeBase}
                    category={item}
                    onDeleteSection={handleDeleteSection}
                    onNewArticle={handleNewArticle}
                    onDeleteArticle={handleDeleteArticle}
                    onUpdateArticleTitle={handleUpdateArticleTitle}
                  />
                )}
              </div>
            </div>
          );
        })}
        <Link
          href={`new`}
          className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border px-12 py-6 text-center hover:border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-5 text-foreground" />
          <span className="mt-2 block text-sm font-medium text-foreground">Add new category</span>
        </Link>
      </div>

      <ConfirmModal ref={confirmDeleteCategory} onYes={onConfirmedDeleteCategory} destructive />
      <ConfirmModal ref={confirmDeleteSection} onYes={onConfirmedDeleteSection} destructive />
      <ConfirmModal ref={confirmDeleteArticle} onYes={onConfirmedDeleteArticle} destructive />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </EditPageLayout>
  );
}

function CategorySections({
  kb,
  category,
  onDeleteSection,
  onNewArticle,
  onDeleteArticle,
  onUpdateArticleTitle,
}: {
  kb: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetailsDto;
  onDeleteSection: (section: { id: string; title: string }) => void;
  onNewArticle: (categoryId: string, sectionId: string | undefined, position: "first" | "last") => void;
  onDeleteArticle: (article: { id: string; title: string }) => void;
  onUpdateArticleTitle: (article: { id: string; title: string }) => void;
}) {
  const [toggledSections, setToggledSections] = useState<string[]>([]);
  const articles = category.articles.filter((f) => !f.sectionId).sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-2 pb-2">
      <div className="w-full space-y-2 rounded-md border border-border bg-secondary px-2 py-2">
        <div className="text-sm font-medium text-foreground/80">Articles</div>
        <div className="space-y-2">
          <ArticlesList kb={kb} articles={articles} onUpdateArticleTitle={onUpdateArticleTitle} onDeleteArticle={onDeleteArticle} />
          <button
            type="button"
            onClick={() => onNewArticle(category.id, undefined, "last")}
            className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border px-12 py-4 text-center hover:border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-muted-foreground">{category.title} - Add article</span>
          </button>
        </div>
        <div className="text-sm font-medium text-foreground/80">Sections</div>
        <div className="space-y-2">
          {category.sections.map((item, idx) => {
            return (
              <div key={idx} className="shadow-2xs rounded-md border border-border bg-background px-4 py-0.5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="hidden shrink-0 sm:flex">
                          <OrderListButtons
                            formData={{
                              categoryId: item.id,
                            }}
                            actionName="set-section-orders"
                            index={idx}
                            items={category.sections}
                            editable={true}
                          />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-foreground">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-2">
                                <div>{item.title}</div>
                                <div>•</div>
                                <div className="truncate text-xs text-muted-foreground">
                                  {category.articles.filter((f) => f.sectionId === item.id).length}{" "}
                                  {category.articles.filter((f) => f.sectionId === item.id).length === 1 ? "article" : "articles"}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <DeleteButton
                          onDelete={() => onDeleteSection(item)}
                          canDelete={category.articles.filter((f) => f.sectionId === item.id).length === 0}
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setToggledSections((prev) => {
                              if (prev.includes(item.id)) {
                                return prev.filter((f) => f !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <FolderIconFilled className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                        </button>
                        <Link
                          href={`${category.id}/sections/${item.id}`}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onNewArticle(category.id, item.id, "first")}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PlusIcon className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {toggledSections.includes(item.id) && (
                  <SectionArticles
                    kb={kb}
                    category={category}
                    section={item}
                    onNewArticle={onNewArticle}
                    onUpdateArticleTitle={onUpdateArticleTitle}
                    onDeleteArticle={onDeleteArticle}
                  />
                )}
              </div>
            );
          })}
          <Link
            href={`${category.id}/sections/new`}
            className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border px-12 py-4 text-center hover:border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-muted-foreground">Add section</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function SectionArticles({
  kb,
  category,
  section,
  onNewArticle,
  onUpdateArticleTitle,
  onDeleteArticle,
}: {
  kb: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetailsDto;
  section: { id: string; order: number; title: string; description: string };
  onNewArticle: (categoryId: string, sectionId: string, position: "first" | "last") => void;
  onUpdateArticleTitle: (article: { id: string; title: string }) => void;
  onDeleteArticle: (article: { id: string; title: string }) => void;
}) {
  const articles = category.articles.filter((f) => f.sectionId === section.id).sort((a, b) => a.order - b.order);
  return (
    <div className="space-y-2 pb-2">
      <div className="w-full space-y-2 rounded-md border border-border bg-secondary px-2 py-2">
        <div className="space-y-2">
          <ArticlesList kb={kb} articles={articles} onUpdateArticleTitle={onUpdateArticleTitle} onDeleteArticle={onDeleteArticle} />
          <button
            type="button"
            onClick={() => onNewArticle(category.id, section.id, "last")}
            className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border px-12 py-4 text-center hover:border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="block text-xs font-medium text-muted-foreground">{section.title} - Add article</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function ArticlesList({
  kb,
  articles,
  onUpdateArticleTitle,
  onDeleteArticle,
}: {
  kb: KnowledgeBaseDto;
  articles: {
    id: string;
    order: number;
    title: string;
    description: string;
    slug: string;
    language: string;
    sectionId: string | null;
    publishedAt: Date | null;
  }[];
  onUpdateArticleTitle: (article: { id: string; title: string }) => void;
  onDeleteArticle: (article: { id: string; title: string }) => void;
}) {
  const handleUpdateArticleTitle = (articleId: string, newTitle: string) => {
    const article = articles.find((article) => article.id === articleId);
    if (article) {
      const updatedArticle = { ...article, title: newTitle };
      onUpdateArticleTitle(updatedArticle);
    }
  };
  return (
    <DraggableList
      className="space-y-1"
      items={articles}
      actionName="set-article-orders"
      render={(item) => {
        return (
          <div className="shadow-2xs rounded-md border border-border bg-background px-4 py-0.5">
            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className="flex items-center space-x-3 truncate">
                    <div className="flex items-center space-x-2 truncate text-sm text-foreground">
                      <div className="flex items-baseline space-x-1 truncate">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <ColorBadge color={item.publishedAt ? Colors.GREEN : Colors.YELLOW} />
                            <div className="flex flex-col">
                              <div
                                className="focus:outline-hidden flex cursor-text items-baseline space-x-1 text-sm text-foreground"
                                contentEditable
                                suppressContentEditableWarning
                                onBlur={(event) => handleUpdateArticleTitle(item.id, event.target.innerText)}
                                onPaste={(event) => {
                                  event.preventDefault();
                                  const plainText = event.clipboardData.getData("text/plain");
                                  (event.target as HTMLElement).textContent = plainText;
                                }}
                              >
                                {item.title || "{Untitled}"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {KnowledgeBaseUtils.getArticleUrl({
                                  kb,
                                  article: item,
                                  params: {},
                                })}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 space-x-1">
                  <div className="flex items-center space-x-1 truncate p-1">
                    <Link
                      href={`/admin/knowledge-base/bases/${kb.slug}/articles/${item.language}/${item.id}`}
                      className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    >
                      <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
                    </Link>
                    <button
                      type="button"
                      className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      onClick={() => onDeleteArticle(item)}
                    >
                      <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      }}
    />
  );
}

function DeleteButton({ onDelete, canDelete }: { onDelete: () => void; canDelete: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        !canDelete ? "cursor-not-allowed opacity-50" : "hover:bg-secondary/90"
      )}
      disabled={!canDelete}
      onClick={onDelete}
    >
      <TrashIcon className={clsx("h-4 w-4 text-gray-300", canDelete && "group-hover:text-muted-foreground")} />
    </button>
  );
}
