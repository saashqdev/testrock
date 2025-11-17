import { BlogCategory, BlogTag } from "@prisma/client";
import { redirect } from "next/navigation";
import { Metadata } from "next";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { getCategory, createCategory } from "@/utils/api/server/BlogApi";
import { storeSupabaseFile } from "@/utils/integrations/supabaseService";
import { getUserInfo } from "@/lib/services/session.server";
import { BlogPostWithDetailsDto } from "@/db/models/blog/BlogModel";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import UrlUtils from "@/utils/app/UrlUtils";
import { getPlanFeatureUsage } from "@/utils/services/server/subscriptionService";
import { DefaultFeatures } from "@/lib/dtos/shared/DefaultFeatures";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import FormHelper from "@/lib/helpers/FormHelper";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export async function generateMetadata({ params }: { params: any }): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("blog.new")} | ${process.env.APP_NAME}`,
  };
}

export type LoaderData = {
  metatags: MetaTagsDto;
  categories: BlogCategory[];
  tags: BlogTag[];
  featureUsageEntity: PlanFeatureUsageDto | undefined;
};
export const loader = async ({ request, params }: { request: Request; params: any }) => {
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  if (tenantId === null) {
    await verifyUserHasPermission("admin.blog.create");
  }
  const featureUsageEntity = tenantId ? await getPlanFeatureUsage(tenantId, DefaultFeatures.BlogPosts) : undefined;
  const data: LoaderData = {
    metatags: [{ title: `${t("blog.new")} | ${process.env.APP_NAME}` }],
    categories: await db.blogCategories.getAllBlogCategories(tenantId),
    tags: await db.blogTags.getAllBlogTags(tenantId),
    featureUsageEntity,
  };
  return data;
};

export type ActionData = {
  error?: string;
  createdPost?: BlogPostWithDetailsDto | null;
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const userInfo = await getUserInfo();
  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const content = form.get("content")?.toString() ?? "";
  if (action === "create") {
    const title = form.get("title")?.toString() ?? "";
    const slug = form.get("slug")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const date = form.get("date")?.toString() ?? "";
    const image = form.get("image")?.toString() ?? "";
    const published = FormHelper.getBoolean(form, "published") ?? false;
    const readingTime = form.get("reading-time")?.toString() ?? "";
    const categoryId = form.get("category")?.toString() ?? "";
    const tags = form.get("tags")?.toString() ?? "";
    const contentType = form.get("contentType")?.toString() ?? "";
    const addingCategoryName = form.get("new-category")?.toString() ?? "";

    try {
      let category: BlogCategory | null = null;
      if (addingCategoryName) {
        category = await getCategory({ tenantId, idOrName: { name: addingCategoryName } });
        if (!category) {
          category = await createCategory({ tenantId, name: addingCategoryName });
        }
      }

      const blogPost = await db.blog.createBlogPost({
        tenantId,
        slug,
        title,
        description,
        date: new Date(date),
        image: await storeSupabaseFile({ bucket: "blog", content: image, id: slug }),
        content,
        readingTime,
        published,
        authorId: userInfo.userId,
        categoryId: categoryId.length ? categoryId : category?.id ?? null,
        tagNames: tags.split(",").filter((f: string) => f.trim() !== ""),
        contentType,
      });

      if (blogPost) {
        return redirect(UrlUtils.getBlogPath(params, blogPost.slug));
      } else {
        return Response.json({ error: "Could not create post" }, { status: 400 });
      }
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

