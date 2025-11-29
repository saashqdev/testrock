import { redirect } from "next/navigation";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { KbCategoryDto } from "@/modules/knowledgeBase/dtos/KbCategoryDto";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { KbSearchResultDto } from "@/modules/knowledgeBase/dtos/KbSearchResultDto";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export type LoaderData = {
  metatags?: MetaTagsDto;
  kb: KnowledgeBaseDto;
  search: KbSearchResultDto | undefined;
  item: KbCategoryDto | null;
  language: string;
  allCategories: KbCategoryDto[];
};
export const loader = async (props: IServerComponentsProps, { kbSlug }: { kbSlug?: string } = {}) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const kb = await KnowledgeBaseService.get({ slug: kbSlug ?? params.slug!, enabled: true, request });
  const language = params.lang ?? kb.defaultLanguage;

  const item = await KnowledgeBaseService.getCategory({
    kb,
    category: params.category ?? "",
    language,
    params,
    request,
  });
  if (!item) {
    throw redirect(KnowledgeBaseUtils.getKbUrl({ kb, params }));
  }
  const searchParamsObj = await props.searchParams;
  const query = searchParamsObj?.q?.toString() || new URL(request.url).searchParams.get("q")?.toString();
  const data: LoaderData = {
    metatags: item?.metatags,
    kb,
    search: await KnowledgeBaseService.search({ query, kb, params, request }),
    item,
    allCategories: await KnowledgeBaseService.getCategories({
      kb,
      params,
      request,
    }),
    language,
  };
  return data;
};
