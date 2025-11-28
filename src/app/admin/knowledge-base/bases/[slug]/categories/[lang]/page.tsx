import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import UrlUtils from "@/utils/app/UrlUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import CategoriesClient from "../categories-lang-client";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseCategoryWithDetailsDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  const items = await db.kbCategories.getAllKnowledgeBaseCategories({
    knowledgeBaseSlug: params.slug!,
    language: params.lang!,
  });
  const data: LoaderData = {
    knowledgeBase,
    items,
  };
  return data;
}

export default async function CategoriesPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getData(props);

  // Server Actions
  async function handleDeleteCategory(id: string) {
    "use server";
    const request = props.request!;
    await verifyUserHasPermission("admin.kb.delete");
    const existing = await db.kbCategories.getKbCategoryById(id);
    if (!existing) {
      throw new Error("Category not found");
    }
    await db.kbCategories.deleteKnowledgeBaseCategory(id);
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleDeleteSection(id: string) {
    "use server";
    const request = props.request!;
    await verifyUserHasPermission("admin.kb.delete");
    const existing = await db.kbCategorySections.getKbCategorySectionById(id);
    if (!existing) {
      throw new Error("Section not found");
    }
    await db.kbCategorySections.deleteKnowledgeBaseCategorySection(id);
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleDeleteArticle(id: string) {
    "use server";
    const request = props.request!;
    await verifyUserHasPermission("admin.kb.delete");
    const existing = await db.kbArticles.getKbArticleById(id);
    if (!existing) {
      throw new Error("Article not found");
    }
    await db.kbArticles.deleteKnowledgeBaseArticle(id);
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleDuplicate(categoryId: string) {
    "use server";
    const request = props.request!;
    await verifyUserHasPermission("admin.kb.create");
    const kb = await KnowledgeBaseService.get({ slug: params.slug!, request });
    await KnowledgeBaseService.duplicateCategory({ kb, language: params.lang!, categoryId });
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleNewArticle(categoryId: string, sectionId: string | undefined, position: "first" | "last") {
    "use server";
    const request = props.request!;
    await verifyUserHasPermission("admin.kb.create");
    const userInfo = await getUserInfo();
    const kb = await KnowledgeBaseService.get({ slug: params.slug!, request });
    await KnowledgeBaseService.newArticle({
      kb,
      params,
      categoryId: categoryId.length > 0 ? categoryId : undefined,
      sectionId: sectionId && sectionId.length > 0 ? sectionId : undefined,
      userId: userInfo.userId,
      position: position as any,
    });
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleUpdateArticleTitle(id: string, title: string) {
    "use server";
    const request = props.request!;
    await verifyUserHasPermission("admin.kb.update");
    const kb = await KnowledgeBaseService.get({ slug: params.slug!, request });
    const slug = UrlUtils.slugify(title);
    const existing = await db.kbArticles.getKbArticleBySlug({
      knowledgeBaseId: kb.id,
      slug,
      language: params.lang!,
    });
    if (existing && existing.id !== id) {
      throw new Error("Slug already exists");
    }
    await db.kbArticles.updateKnowledgeBaseArticle(id, {
      title,
      slug,
    });
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleSetCategoryOrders(items: { id: string; order: number }[]) {
    "use server";
    await verifyUserHasPermission("admin.kb.update");
    for (const item of items) {
      await db.kbCategories.updateKnowledgeBaseCategory(item.id, {
        order: item.order,
      });
    }
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  async function handleSetSectionOrders(items: { id: string; order: number }[]) {
    "use server";
    await verifyUserHasPermission("admin.kb.update");
    for (const item of items) {
      await db.kbCategorySections.updateKnowledgeBaseCategorySection(item.id, {
        order: item.order,
      });
    }
    revalidatePath(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  return (
    <CategoriesClient
      data={data}
      onDeleteCategory={handleDeleteCategory}
      onDeleteSection={handleDeleteSection}
      onDeleteArticle={handleDeleteArticle}
      onDuplicate={handleDuplicate}
      onNewArticle={handleNewArticle}
      onUpdateArticleTitle={handleUpdateArticleTitle}
      onSetCategoryOrders={handleSetCategoryOrders}
      onSetSectionOrders={handleSetSectionOrders}
    />
  );
}
