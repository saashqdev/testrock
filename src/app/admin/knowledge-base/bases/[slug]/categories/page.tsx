import { redirect } from "next/navigation";
import Link from "next/link";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseUtils from "@/modules/knowledgeBase/utils/KnowledgeBaseUtils";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  items: KnowledgeBaseCategoryWithDetailsDto[];
};
export const loader = async (props: IServerComponentsProps) => {
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
  const items = await db.kbCategories.getAllKnowledgeBaseCategories({
    knowledgeBaseSlug: params.slug!,
    language: undefined,
  });
  const data: LoaderData = {
    knowledgeBase,
    items,
  };
  return data;
};
export default async function KnowledgeBaseCategoriesPage(props: IServerComponentsProps) {
  const data = await loader(props);
  const params = (await props.params) || {};
  return (
    <EditPageLayout
      title="Categories"
      withHome={false}
      menu={[
        { title: "Knowledge Bases", routePath: "/admin/knowledge-base/bases" },
        { title: data.knowledgeBase.title, routePath: `/admin/knowledge-base/bases/${data.knowledgeBase.slug}` },
        { title: "Categories", routePath: `/admin/knowledge-base/bases/${params.slug}/categories` },
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
                <div className="text-sm">{data.items.filter((x) => x.language === f).length} categories</div>
              </Link>
            </div>
          );
        })}
      </div>
    </EditPageLayout>
  );
}
