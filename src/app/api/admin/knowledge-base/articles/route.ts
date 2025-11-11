import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { getUserInfo } from "@/lib/services/session.server";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";

type LoaderData = {
  knowledgeBases: KnowledgeBaseDto[];
  items: KnowledgeBaseArticleWithDetailsDto[];
  pagination: PaginationDto;
  filterableProperties: FilterablePropertyDto[];
};

// GET - Load articles data
export async function GET(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.kb.view");
    
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
          ...(await db.kbCategories.getAllKnowledgeBaseCategories({ 
            knowledgeBaseSlug: undefined, 
            language: undefined 
          })).map((item) => ({
            value: item.id,
            name: item.title,
          })),
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
      knowledgeBaseSlug: undefined,
      language: undefined,
      pagination: currentPagination,
      filters: {
        title: filtered.title,
        description: filtered.description,
        categoryId: filtered.categoryId === "null" ? null : filtered.categoryId,
        content: filtered.content,
      },
    });
    
    const data: LoaderData = {
      knowledgeBases: await KnowledgeBaseService.getAll({ request }),
      items,
      pagination,
      filterableProperties,
    };
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error loading articles:", error);
    return NextResponse.json(
      { error: "Failed to load articles" },
      { status: 500 }
    );
  }
}

// POST - Handle actions
export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.kb.update");
    
    const userInfo = await getUserInfo();
    const formData = await request.formData();
    const action = formData.get("action")?.toString() ?? "";

    if (action === "new") {
      await verifyUserHasPermission("admin.kb.create");
      const kbId = formData.get("kbId")?.toString();
      
      if (!kbId) {
        return NextResponse.json({ error: "Knowledge base ID is required" }, { status: 400 });
      }
      
      const kb = await KnowledgeBaseService.getById({ id: kbId, request });
      if (!kb) {
        return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
      }
      
      const created = await KnowledgeBaseService.newArticle({
        kb,
        params: {
          lang: kb.languages.length > 0 ? kb.languages[0] : "en",
        },
        userId: userInfo.userId,
        position: "last",
      });
      
      return NextResponse.json({ 
        redirect: `/admin/knowledge-base/bases/${kb.slug}/articles/${KnowledgeBaseUtils.defaultLanguage}/${created.id}/edit` 
      });
    } 
    
    if (action === "set-orders") {
      const items: { id: string; order: number }[] = formData.getAll("orders[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });

      await Promise.all(
        items.map(async ({ id, order }) => {
          await db.kbCategories.updateKnowledgeBaseCategory(id, {
            order: Number(order),
          });
        })
      );
      
      return NextResponse.json({ updated: true });
    } 
    
    if (action === "set-section-orders") {
      const items: { id: string; order: number }[] = formData.getAll("orders[]").map((f: FormDataEntryValue) => {
        return JSON.parse(f.toString());
      });

      await Promise.all(
        items.map(async ({ id, order }) => {
          await db.kbCategorySections.updateKnowledgeBaseCategorySection(id, {
            order: Number(order),
          });
        })
      );
      
      return NextResponse.json({ updated: true });
    }
    
    if (action === "toggle") {
      const id = formData.get("id")?.toString() ?? "";
      const isFeatured = formData.get("isFeatured")?.toString() === "true";

      const item = await db.kbArticles.getKbArticleById(id);
      if (!item) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      
      const kb = await KnowledgeBaseService.getById({ id: item.knowledgeBaseId, request });
      if (!kb) {
        return NextResponse.json({ error: "Knowledge base not found" }, { status: 404 });
      }

      let featuredOrder = item.featuredOrder;
      if (isFeatured) {
        if (!item.featuredOrder) {
          const featuredArticles = await KnowledgeBaseService.getFeaturedArticles({
            kb,
            params: {},
            request,
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

      return NextResponse.json({ success: "Updated" });
    }
    
    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Error handling action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}
