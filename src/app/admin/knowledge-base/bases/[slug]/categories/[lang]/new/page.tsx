import { redirect } from "next/navigation";
import KbCategoryForm from "@/modules/knowledgeBase/components/bases/KbCategoryForm";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });
  return {
    knowledgeBase,
  };
}

export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.update");
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request,
  });

  if (action === "new") {
    await verifyUserHasPermission("admin.kb.create");
    const slug = form.get("slug")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const description = form.get("description")?.toString() ?? "";
    const icon = form.get("icon")?.toString() ?? "";
    const seoImage = form.get("seoImage")?.toString() ?? "";

    const allCategories = await db.kbCategories.getAllKnowledgeBaseCategories({
      knowledgeBaseSlug: params.slug!,
      language: params.lang!,
    });
    let maxOrder = 0;
    if (allCategories.length > 0) {
      maxOrder = Math.max(...allCategories.map((i) => i.order));
    }

    const existing = await db.kbCategories.getKbCategoryBySlug({
      knowledgeBaseId: knowledgeBase.id,
      slug,
      language: params.lang!,
    });
    if (existing) {
      return Response.json({ error: "Slug already exists" }, { status: 400 });
    }

    try {
      await db.kbCategories.createKnowledgeBaseCategory({
        knowledgeBaseId: knowledgeBase.id,
        slug,
        title,
        description,
        icon,
        language: params.lang!,
        seoImage,
        order: maxOrder + 1,
      });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }

    return redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  } else {
    return Response.json({ error: "Invalid form" }, { status: 400 });
  }
};

export default async function NewKbCategory(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  const params = (await props.params) || {};

  return (
    <div>
      <KbCategoryForm knowledgeBase={data.knowledgeBase} language={params.lang!} />
    </div>
  );
}
