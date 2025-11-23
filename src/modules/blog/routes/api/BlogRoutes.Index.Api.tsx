import { Metadata } from "next";
import { getMetaTags } from "@/modules/pageBlocks/pages/defaultSeoMetaTags";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { BlogPostWithDetailsDto } from "@/db/models/blog/BlogModel";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import AnalyticsService from "@/lib/helpers/server/AnalyticsService";
import UrlUtils from "@/utils/app/UrlUtils";
import { AnalyticsPageView } from "@prisma/client";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { db } from "@/db";

export const generateMetadata = async ({ params }: { params: any }): Promise<Metadata> => {
  return defaultSeoMetaTags({
    title: `Blog | ${process.env.APP_NAME}`,
  });
};
export type LoaderData = {
  metatags: MetaTagsDto;
  items: BlogPostWithDetailsDto[];
  views: AnalyticsPageView[];
};

export const loader = async ({ request, params }: { request: Request; params: any }) => {
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  if (tenantId === null) {
    await verifyUserHasPermission("admin.blog.view");
  }
  const items = await db.blog.getAllBlogPosts({ tenantId });
  const data: LoaderData = {
    metatags: [{ title: `Blog | ${process.env.APP_NAME}` }],
    items,
    views: await AnalyticsService.getPageViews({
      url: { startsWith: UrlUtils.getBlogPath(params) },
    }),
  };
  return data;
};
