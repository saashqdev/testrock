import { redirect } from "next/navigation";
import KbCategorySectionForm from "@/modules/knowledgeBase/components/bases/KbCategorySectionForm";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  category: KnowledgeBaseCategoryWithDetailsDto;
};

async function getPageData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  const category = await db.kbCategories.getKbCategoryById(params.id!);
  if (!category) {
    redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  const data: LoaderData = {
    knowledgeBase,
    category,
  };
  return data;
}

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.update");
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const category = await db.kbCategories.getKbCategoryById(params.id!);
  if (!category) {
    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }

  if (action === "new") {
    await verifyUserHasPermission("admin.kb.create");
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";

    let maxOrder = 0;
    if (category.sections.length > 0) {
      maxOrder = Math.max(...category.sections.map((i) => i.order));
    }

    try {
      await db.kbCategorySections.createKnowledgeBaseCategorySection({
        categoryId: category.id,
        order: maxOrder + 1,
        title,
        description,
      });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};

export default async function KbCategorySectionNewPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getPageData(props);

  return (
    <div>
      <KbCategorySectionForm knowledgeBase={data.knowledgeBase} category={data.category} language={params.lang!} />
    </div>
  );
}
