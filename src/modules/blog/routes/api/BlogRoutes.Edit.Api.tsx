import { BlogCategory, BlogTag } from "@prisma/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getMetaTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { getServerTranslations } from "@/i18n/server";
import { getCategory, createCategory } from "@/utils/api/server/BlogApi";
import FormHelper from "@/lib/helpers/FormHelper";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { storeSupabaseFile } from "@/utils/integrations/supabaseService";
import { getUserInfo } from "@/lib/services/session.server";
import { BlogPostWithDetailsDto } from "@/db/models/blog/BlogModel";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import UrlUtils from "@/utils/app/UrlUtils";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

export const generateMetadata = async ({ params }: { params: any }): Promise<Metadata> => {
  const tenantId = await getTenantIdOrNull({ request: {} as Request, params });
  const item = await db.blog.getBlogPost({ tenantId, idOrSlug: params.id ?? "" });

  return getMetaTags({
    title: item ? `${item.title} | Blog | ${process.env.APP_NAME}` : `Blog | ${process.env.APP_NAME}`,
    description: item?.description || undefined,
    image: item?.image || undefined,
  });
};

export type LoaderData = {
  metatags: Metadata;
  item: BlogPostWithDetailsDto;
  categories: BlogCategory[];
  tags: BlogTag[];
};
export const loader = async ({ request, params }: { request: Request; params: any }) => {
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await db.blog.getBlogPost({ tenantId, idOrSlug: params.id ?? "" });
  if (!item) {
    throw redirect(UrlUtils.getModulePath(params, "blog"));
  }

  const data: LoaderData = {
    metatags: getMetaTags({ title: `Blog | ${process.env.APP_NAME}` }),
    item,
    categories: await db.blogCategories.getAllBlogCategories(tenantId),
    tags: await db.blogTags.getAllBlogTags(tenantId),
  };
  return data;
};

export type ActionData = {
  error?: string;
  createdPost?: BlogPostWithDetailsDto | null;
};
export const action = async ({ request, params }: { request: Request; params: any }) => {
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const userInfo = await getUserInfo();
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const content = form.get("content")?.toString() ?? "";
  if (action === "edit") {
    if (tenantId === null) {
      await verifyUserHasPermission("admin.blog.update");
    }
    const title = form.get("title")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const date = form.get("date")?.toString() ?? "";
    const image = form.get("image")?.toString() ?? "";
    const published = FormHelper.getBoolean(form, "published");
    const readingTime = form.get("reading-time")?.toString() ?? "";
    const categoryId = form.get("category")?.toString() ?? "";
    const tags = form.get("tags")?.toString() ?? "";
    const contentType = form.get("contentType")?.toString() ?? "";
    const addingCategoryName = form.get("new-category")?.toString() ?? "";

    try {
      const blogPost = await db.blog.getBlogPost({ tenantId, idOrSlug: params.id ?? "" });
      if (!blogPost) {
        return redirect(UrlUtils.getModulePath(params, "blog"));
      }
      let category: BlogCategory | null = null;
      if (addingCategoryName) {
        category = await getCategory({ tenantId, idOrName: { name: addingCategoryName } });
        if (!category) {
          category = await createCategory({ tenantId, name: addingCategoryName });
        }
      }
      let authorId = blogPost.authorId;
      if (authorId === null) {
        authorId = userInfo.userId;
      }
      const updated = await db.blog.updateBlogPost(blogPost.id, {
        slug,
        title,
        description,
        date: new Date(date),
        image: await storeSupabaseFile({ bucket: "blog", content: image, id: slug }),
        content,
        readingTime,
        published,
        categoryId: categoryId.length ? categoryId : (category?.id ?? null),
        tagNames: tags.split(",").filter((f: string) => f.trim() != ""),
        contentType,
        authorId,
      });

      return redirect(UrlUtils.getBlogPath(params, updated.slug));
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } else if (action === "delete") {
    if (tenantId === null) {
      await verifyUserHasPermission("admin.blog.delete");
    }
    try {
      await db.blog.deleteBlogPost(params.id ?? "");
      return redirect(UrlUtils.getModulePath(params, "blog"));
    } catch (error: any) {
      return Response.json({ error: error.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};
