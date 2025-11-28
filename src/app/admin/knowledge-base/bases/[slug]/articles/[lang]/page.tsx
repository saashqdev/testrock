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
import ArticlesClient from "../articles-client";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseArticleWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const searchParams = (await props.searchParams) || {};
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request: props.request,
  });
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  const urlSearchParams = new URLSearchParams(searchParams as Record<string, string>);
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
        ...(await db.kbCategories.getAllKnowledgeBaseCategories({ knowledgeBaseSlug: knowledgeBase.slug, language: params.lang! })).map((item) => {
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
  const filters = getFiltersFromCurrentUrl(props.request, filterableProperties);
  const filtered = {
    title: filters.properties.find((f) => f.name === "title")?.value ?? filters.query ?? undefined,
    description: filters.properties.find((f) => f.name === "description")?.value ?? filters.query ?? undefined,
    categoryId: filters.properties.find((f) => f.name === "categoryId")?.value ?? undefined,
    content: filters.properties.find((f) => f.name === "content")?.value ?? filters.query ?? undefined,
  };
  const { items, pagination } = await db.kbArticles.getAllKnowledgeBaseArticlesWithPagination({
    knowledgeBaseSlug: params.slug!,
    language: params.lang!,
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
  const created = await KnowledgeBaseService.newArticle({
    kb,
    params,
    userId,
    position: "last",
  });
  redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${params.lang}/${created.id}/edit`);
}

async function handleDuplicate(kb: KnowledgeBaseDto, lang: string, articleId: string) {
  "use server";
  await verifyUserHasPermission(undefined as any, "admin.kb.create");
  const item = await KnowledgeBaseService.duplicateArticle({ kb, language: lang, articleId });
  redirect(`/admin/knowledge-base/bases/${kb.slug}/articles/${lang}/${item.id}`);
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

  await verifyUserHasPermission("admin.kb.view");

  const data = await getData(props);
  const userInfo = await getUserInfo();

  return (
    <ArticlesClient
      data={data}
      params={params}
      onNewArticle={async () => {
        "use server";
        await handleNewArticle(data.knowledgeBase, params, userInfo.userId);
      }}
      onDuplicate={async (articleId: string) => {
        "use server";
        await handleDuplicate(data.knowledgeBase, params.lang!, articleId);
      }}
      onToggleFeatured={async (itemId: string, isFeatured: boolean) => {
        "use server";
        await handleToggleFeatured(itemId, isFeatured, data.knowledgeBase);
      }}
    />
  );
}
