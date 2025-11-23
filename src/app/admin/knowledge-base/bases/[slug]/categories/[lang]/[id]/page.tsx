import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import KbCategoryClient from "./KbCategoryClient";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseCategoryWithDetailsDto;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  const item = await db.kbCategories.getKbCategoryById(params.id!);
  if (!item) {
    redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  return {
    knowledgeBase,
    item,
  };
}

async function deleteCategory(categoryId: string, slug: string, lang: string) {
  "use server";
  await db.kbCategories.deleteKnowledgeBaseCategory(categoryId);
  revalidatePath(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
  redirect(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
}

async function editCategory(
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
) {
  "use server";
  const existing = await db.kbCategories.getKbCategoryBySlug({
    knowledgeBaseId,
    slug: formData.slug,
    language: lang,
  });

  if (existing && existing.id !== categoryId) {
    throw new Error("Slug already exists");
  }

  await db.kbCategories.updateKnowledgeBaseCategory(categoryId, {
    slug: formData.slug,
    title: formData.title,
    description: formData.description,
    icon: formData.icon,
    language: lang,
    seoImage: formData.seoImage,
  });

  revalidatePath(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
  redirect(`/admin/knowledge-base/bases/${slug}/categories/${lang}`);
}

async function setOrders(items: { id: string; order: number }[]) {
  "use server";
  await Promise.all(
    items.map(async ({ id, order }) => {
      await db.kbArticles.updateKnowledgeBaseArticle(id, {
        order: Number(order),
      });
    })
  );
}

export default async function Page(props: IServerComponentsProps) {
  const data = await getData(props);
  const params = (await props.params) || {};

  return (
    <KbCategoryClient
      knowledgeBase={data.knowledgeBase}
      item={data.item}
      lang={params.lang!}
      slug={params.slug!}
      onDelete={deleteCategory}
      onEdit={editCategory}
      onSetOrders={setOrders}
    />
  );
}
