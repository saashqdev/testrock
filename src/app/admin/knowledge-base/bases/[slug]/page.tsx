import { redirect } from "next/navigation";
import Link from "next/link";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { KnowledgeBaseWithDetailsDto } from "@/db/models/knowledgeBase/KnowledgeBaseModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { Button } from "@/components/ui/button";

type LoaderData = {
  knowledgeBase: KnowledgeBaseWithDetailsDto;
  stats: {
    totalCategories: number;
    totalArticles: number;
  };
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.kb.view");
  
  const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseBySlug(params.slug!);
  
  if (!knowledgeBase) {
    return redirect("/admin/knowledge-base/bases");
  }
  
  const categories = await db.kbCategories.getAllKnowledgeBaseCategories({
    knowledgeBaseSlug: params.slug!,
    language: undefined,
  });
  
  const articles = await db.kbArticles.getAllKnowledgeBaseArticles({
    knowledgeBaseSlug: params.slug!,
    language: undefined,
  });
  
  const data: LoaderData = {
    knowledgeBase,
    stats: {
      totalCategories: categories.length,
      totalArticles: articles.length,
    },
  };
  return data;
};

export default async function KnowledgeBaseOverviewPage(props: IServerComponentsProps) {
  const data = await loader(props);
  const params = (await props.params) || {};
  
  return (
    <EditPageLayout
      title={data.knowledgeBase.title}
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${params.slug}` },
      ]}
    >
      <div className="space-y-6">
        {/* Knowledge Base Info */}
        <div className="rounded-lg border border-border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">{data.knowledgeBase.title}</h2>
            {data.knowledgeBase.description && (
              <p className="text-muted-foreground mt-1">{data.knowledgeBase.description}</p>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg bg-secondary p-4">
              <div className="text-2xl font-bold">{data.knowledgeBase.languages.length}</div>
              <div className="text-sm text-muted-foreground">Languages</div>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <div className="text-2xl font-bold">{data.stats.totalCategories}</div>
              <div className="text-sm text-muted-foreground">Categories</div>
            </div>
            <div className="rounded-lg bg-secondary p-4">
              <div className="text-2xl font-bold">{data.stats.totalArticles}</div>
              <div className="text-sm text-muted-foreground">Articles</div>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button asChild>
              <Link href={`/admin/knowledge-base/bases/edit/${data.knowledgeBase.id}`}>
                Edit Settings
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`${data.knowledgeBase.basePath}/${data.knowledgeBase.defaultLanguage || data.knowledgeBase.languages[0]}`} target="_blank">
                Preview
              </Link>
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link
            href={`/admin/knowledge-base/bases/${params.slug}/categories`}
            className="group rounded-lg border border-border p-6 hover:border-primary hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary">Manage Categories</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.stats.totalCategories} categories across all languages
                </p>
              </div>
              <svg className="h-6 w-6 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
          
          <Link
            href={`/admin/knowledge-base/bases/${params.slug}/articles/${data.knowledgeBase.defaultLanguage || data.knowledgeBase.languages[0]}`}
            className="group rounded-lg border border-border p-6 hover:border-primary hover:bg-accent transition-colors"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold group-hover:text-primary">Manage Articles</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {data.stats.totalArticles} articles across all languages
                </p>
              </div>
              <svg className="h-6 w-6 text-muted-foreground group-hover:text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </EditPageLayout>
  );
}
