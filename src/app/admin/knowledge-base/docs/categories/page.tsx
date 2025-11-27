import Link from "next/link";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Button } from "@/components/ui/button";

type LoaderData = {
  knowledgeBases: KnowledgeBaseDto[];
  categoriesByBase: Record<string, { language: string; count: number }[]>;
};

export const loader = async (props: IServerComponentsProps) => {
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  
  const knowledgeBases = await KnowledgeBaseService.getAll({ request });
  
  const categoriesByBase: Record<string, { language: string; count: number }[]> = {};
  
  for (const base of knowledgeBases) {
    const allCategories = await db.kbCategories.getAllKnowledgeBaseCategories({
      knowledgeBaseSlug: base.slug,
      language: undefined,
    });
    
    const byLanguage: Record<string, number> = {};
    for (const category of allCategories) {
      byLanguage[category.language] = (byLanguage[category.language] || 0) + 1;
    }
    
    categoriesByBase[base.slug] = Object.entries(byLanguage).map(([language, count]) => ({
      language,
      count,
    }));
  }
  
  const data: LoaderData = {
    knowledgeBases,
    categoriesByBase,
  };
  return data;
};

export default async function AllCategoriesPage(props: IServerComponentsProps) {
  const data = await loader(props);
  
  if (data.knowledgeBases.length === 0) {
    return (
      <EditPageLayout
        title="Categories"
        withHome={false}
        menu={[
          { title: "Knowledge Base", routePath: "/admin/knowledge-base" },
          { title: "Categories", routePath: "/admin/knowledge-base/docs/categories" },
        ]}
      >
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">No knowledge bases found. Create one first to add categories.</p>
          <Button asChild>
            <Link href="/admin/knowledge-base/bases/new">Create Knowledge Base</Link>
          </Button>
        </div>
      </EditPageLayout>
    );
  }
  
  return (
    <EditPageLayout
      title="Categories"
      withHome={false}
      menu={[
        { title: "Knowledge Base", routePath: "/admin/knowledge-base" },
        { title: "Categories", routePath: "/admin/knowledge-base/docs/categories" },
      ]}
    >
      <div className="space-y-6">
        {data.knowledgeBases.map((base) => {
          const categories = data.categoriesByBase[base.slug] || [];
          const totalCategories = categories.reduce((sum, c) => sum + c.count, 0);
          
          return (
            <div key={base.id} className="rounded-lg border border-border p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{base.title}</h3>
                  <p className="text-sm text-muted-foreground">{base.description || base.slug}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">{totalCategories}</div>
                  <div className="text-xs text-muted-foreground">Total Categories</div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {base.languages.map((lang) => {
                  const langCategories = categories.find((c) => c.language === lang);
                  const count = langCategories?.count || 0;
                  
                  return (
                    <div
                      key={lang}
                      className="flex items-center justify-between rounded-lg border border-border p-4 hover:border-primary hover:bg-accent transition-colors"
                    >
                      <Link
                        href={`/admin/knowledge-base/bases/${base.slug}/categories/${lang}`}
                        className="flex-1"
                      >
                        <div className="font-medium">{KnowledgeBaseUtils.getLanguageName(lang)}</div>
                        <div className="text-sm text-muted-foreground">{count} categories</div>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/knowledge-base/bases/${base.slug}/categories/${lang}/new`}>
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                          </Link>
                        </Button>
                        <Link href={`/admin/knowledge-base/bases/${base.slug}/categories/${lang}`}>
                          <svg className="h-5 w-5 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
