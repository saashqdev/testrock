import { redirect } from "next/navigation";
import KbCategoryClient from "./KbCategoryClient";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { KnowledgeBaseCategoryWithDetailsDto } from "@/modules/knowledgeBase/helpers/KbCategoryModelHelper";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  knowledgeBase: KnowledgeBaseDto;
  item: KnowledgeBaseCategoryWithDetailsDto;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.kb.view");
  const knowledgeBase = await KnowledgeBaseService.get({
    slug: params.slug!,
    request: props.request!,
  });
  const item = await db.kbCategories.getKbCategoryById(params.id!);
  if (!item) {
    redirect(`/admin/knowledge-base/bases/${params.slug}/categories/${params.lang}`);
  }
  return {
    knowledgeBase,
    item,
  };
}

export default async function Page(props: IServerComponentsProps) {
  const data = await getData(props);
  const params = (await props.params) || {};

  return (
    <KbCategoryClient
      knowledgeBase={data.knowledgeBase}
      item={data.item}
      lang={params.lang!}
      slug={params.slug!}
    />
  );
}
