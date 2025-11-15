import { redirect } from "next/navigation";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getUserInfo } from "@/lib/services/session.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import ArticlesClient from "./articles-client";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseArticleWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
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
  
  // Use default language if not specified
  const defaultLang = knowledgeBase.defaultLanguage || knowledgeBase.languages[0] || 'en';
  
  const urlSearchParams = new URL(request.url).searchParams;
  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "title",
      title: "Title",
    },
    {
      name: "description",
      title: "Description",
    },
    {
      name: "categoryId",
      title: "Category",
      options: [
        { value: "null", name: "{null}" },
        ...(await db.kbCategories.getAllKnowledgeBaseCategories({ knowledgeBaseSlug: knowledgeBase.slug, language: defaultLang })).map((item) => {
          return {
            value: item.id,
            name: item.title,
          };
        }),
      ],
    },
    {
      name: "content",
      title: "Content",
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);
  const filtered = {
    title: filters.properties.find((f) => f.name === "title")?.value ?? filters.query ?? undefined,
    description: filters.properties.find((f) => f.name === "description")?.value ?? filters.query ?? undefined,
    categoryId: filters.properties.find((f) => f.name === "categoryId")?.value ?? undefined,
    content: filters.properties.find((f) => f.name === "content")?.value ?? filters.query ?? undefined,
  };
  const { items, pagination } = await db.kbArticles.getAllKnowledgeBaseArticlesWithPagination({
    knowledgeBaseSlug: params.slug!,
    language: defaultLang,
    pagination: currentPagination,
    filters: {
      title: filtered.title,
      description: filtered.description,
      categoryId: filtered.categoryId === "null" ? null : filtered.categoryId,
      content: filtered.content,
    },
  });
  const data: LoaderData = {
    knowledgeBase,
    items,
    pagination,
    filterableProperties,
  };
  return data;
}

// Server Actions
async function handleNewArticle(kb: KnowledgeBaseDto, params: any, userId: string) {
  "use server";
  await verifyUserHasPermission(undefined as any, "admin.kb.create");
  const defaultLang = kb.defaultLanguage || kb.languages[0] || 'en';
  const created = await KnowledgeBaseService.newArticle({
    kb,
    params: { ...params, lang: defaultLang },
    userId,
    position: "last",
  });
  redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${defaultLang}/${created.id}/edit`);
}

async function handleDuplicate(kb: KnowledgeBaseDto, articleId: string) {
  "use server";
  await verifyUserHasPermission(undefined as any, "admin.kb.create");
  const defaultLang = kb.defaultLanguage || kb.languages[0] || 'en';
  const item = await KnowledgeBaseService.duplicateArticle({ kb, language: defaultLang, articleId });
  redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${defaultLang}/${item.id}`);
}

async function handleToggleFeatured(itemId: string, isFeatured: boolean, kb: KnowledgeBaseDto) {
  "use server";
  await verifyUserHasPermission(undefined as any, "admin.kb.update");
  
  const item = await db.kbArticles.getKbArticleById(itemId);
  if (!item) {
    throw new Error("Not found");
  }

  let featuredOrder = item.featuredOrder;
  if (isFeatured) {
    if (!item.featuredOrder) {
      const featuredArticles = await KnowledgeBaseService.getFeaturedArticles({
        kb,
        params: {},
        request: undefined as any,
      });
      let maxOrder = 0;
      if (featuredArticles.length > 0) {
        maxOrder = Math.max(...featuredArticles.map((p) => p.featuredOrder ?? 0));
      }
      featuredOrder = maxOrder + 1;
    }
  } else {
    featuredOrder = null;
  }
  await db.kbArticles.updateKnowledgeBaseArticle(item.id, {
    featuredOrder,
  });
}

export default async function ArticlesPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  
  await verifyUserHasPermission("admin.kb.view");
  
  const data = await getData(props);
  const userInfo = await getUserInfo();
  
  // Add default language to params
  const defaultLang = data.knowledgeBase.defaultLanguage || data.knowledgeBase.languages[0] || 'en';
  const paramsWithLang = { ...params, lang: defaultLang };

  return (
    <ArticlesClient 
      data={data} 
      params={paramsWithLang}
      onNewArticle={async () => {
        "use server";
        await handleNewArticle(data.knowledgeBase, paramsWithLang, userInfo.userId);
      }}
      onDuplicate={async (articleId: string) => {
        "use server";
        await handleDuplicate(data.knowledgeBase, articleId);
      }}
      onToggleFeatured={async (itemId: string, isFeatured: boolean) => {
        "use server";
        await handleToggleFeatured(itemId, isFeatured, data.knowledgeBase);
      }}
    />
  );
}
