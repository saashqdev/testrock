import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { KbArticleDto } from "@/modules/knowledgeBase/dtos/KbArticleDto";
import { KbCategoryDto } from "@/modules/knowledgeBase/dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { KbSearchResultDto } from "@/modules/knowledgeBase/dtos/KbSearchResultDto";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import RedirectsService from "@/modules/redirects/RedirectsService";
import { getAnalyticsInfo } from "@/utils/analyticsCookie.server";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export namespace KbRoutesIndexApi {
  export type LoaderData = {
    metatags: MetaTagsDto;
    kb: KnowledgeBaseDto;
    search: KbSearchResultDto | undefined;
    categories: KbCategoryDto[];
    featured: KbArticleDto[];
    isAdmin: boolean;
  };
  export const loader = async (props: IServerComponentsProps, { kbSlug }: { kbSlug?: string } = {}) => {
    const params = (await props.params) || {};
    const request = props.request!;
    if (params.lang && !KnowledgeBaseUtils.supportedLanguages.find((f) => f.value === params.lang)) {
      await RedirectsService.findAndRedirect({ request });
    }
    const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });

    const { userAnalyticsId } = await getAnalyticsInfo(request);
    const userInfo = await getUserInfo();

    await db.kbAnalytics.createKnowledgeBaseView({ userAnalyticsId, knowledgeBaseId: kb.id });
    const searchParams = new URL(request.url).searchParams;
    const query = searchParams.get("q")?.toString();
    const currentUser = await db.users.getUser(userInfo.userId);
    const data: LoaderData = {
      metatags: kb.metatags,
      kb,
      search: await KnowledgeBaseService.search({ query, kb, params, request }),
      categories: await KnowledgeBaseService.getCategories({
        kb,
        params,
        request,
      }),
      featured: await KnowledgeBaseService.getFeaturedArticles({
        kb,
        params,
        request,
      }),
      isAdmin: !!currentUser?.admin,
      // searchResult,
    };
    return data;
  };
}
