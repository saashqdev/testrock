import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getUserInfo } from "@/lib/services/session.server";
import { KbArticleDto } from "@/modules/knowledgeBase/dtos/KbArticleDto";
import { KbCategoryDto } from "@/modules/knowledgeBase/dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { KbSearchResultDto } from "@/modules/knowledgeBase/dtos/KbSearchResultDto";
import { getAnalyticsInfo } from "@/utils/analyticsCookie.server";
import RedirectsService from "@/modules/redirects/RedirectsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  metatags?: MetaTagsDto;
  kb: KnowledgeBaseDto;
  search: KbSearchResultDto | undefined;
  item: {
    article: KbArticleDto;
    category: KbCategoryDto;
  } | null;
  userState: {
    hasThumbsUp: boolean;
    hasThumbsDown: boolean;
  };
  isAdmin: boolean;
  categories: KbCategoryDto[];
};
export const loader = async (props: IServerComponentsProps, { kbSlug }: { kbSlug?: string } = {}) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await RedirectsService.findAndRedirect({ request });
  const analyticsInfo = await getAnalyticsInfo(request);
  const userInfo = await getUserInfo();
  const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });
  const item = await KnowledgeBaseService.getArticle({
    kb,
    slug: params.article ?? "",
    params,
    request,
  });
  if (!item) {
    throw redirect(KnowledgeBaseUtils.getKbUrl({ kb, params }));
  }

  if (item?.article) {
    db.kbAnalytics.createKnowledgeBaseArticleView({ userAnalyticsId: analyticsInfo.userAnalyticsId, articleId: item.article.id });
  }
  let userState = await db.kbAnalytics.getArticleStateByUserAnalyticsId({
    userAnalyticsId: analyticsInfo.userAnalyticsId,
    articleId: item?.article.id ?? "",
  });
  const searchParams = new URL(request.url).searchParams;
  const query = searchParams.get("q")?.toString();
  const currentUser = await db.users.getUser(userInfo.userId);
  KnowledgeBaseUtils.fixDarkMode({ article: item.article });
  const data: LoaderData = {
    metatags: item?.article.metatags,
    kb,
    search: await KnowledgeBaseService.search({ query, kb, params, request }),
    item,
    userState,
    isAdmin: !!currentUser?.admin,
    categories: await KnowledgeBaseService.getCategories({
      kb,
      params,
      request,
    }),
  };
  return data;
};

export const action = async (props: IServerComponentsProps, { kbSlug }: { kbSlug?: string } = {}) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const { userAnalyticsId } = await getAnalyticsInfo(request);
  const form = await request.formData();
  const action = form.get("action") as string;
  const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });
  const item = await KnowledgeBaseService.getArticle({
    kb,
    slug: params.article ?? "",
    params,
    request,
  });
  if (!item) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  if (action === "thumbsUp") {
    await db.kbAnalytics.voteArticle({ userAnalyticsId, articleId: item.article.id, type: "up" });
    return Response.json({ success: true });
  } else if (action === "thumbsDown") {
    await db.kbAnalytics.voteArticle({ userAnalyticsId, articleId: item.article.id, type: "down" });
    return Response.json({ success: true });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
};

