import { redirect } from "next/navigation";
import Link from "next/link";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { KnowledgeBaseArticleWithDetailsDto } from "@/db/models/knowledgeBase/KbArticlesModel";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type PageProps = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseArticleWithDetailsDto[];
};

async function getData(props: IServerComponentsProps): Promise<PageProps> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  if (!knowledgeBase) {
    redirect("/admin/knowledge-base/bases");
  }
  const items = await db.kbArticles.getAllKnowledgeBaseArticles({
    knowledgeBaseSlug: params.slug!,
    language: undefined,
  });
  return {
    knowledgeBase,
    items,
  };
}

export default async function ArticlesPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const params = (await props.params) || {};
  return (
    <EditPageLayout
      title="Articles"
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Articles", routePath: `/admin/knowledge-base/bases/${params.slug}/articles` },
      ]}
    >
      <div className="space-y-2">
        {data.knowledgeBase.languages.map((f) => {
          return (
            <div key={f} className="space-y-2">
              <Link
                href={f}
                className="border-border hover:border-border relative block space-y-2 rounded-lg border-2 border-dashed px-12 py-6 text-center focus:border-solid focus:outline-hidden"
              >
                <div className="font-bold">{KnowledgeBaseUtils.getLanguageName(f)}</div>
                <div className="text-sm">{data.items.filter((x) => x.language === f).length} articles</div>
              </Link>
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
