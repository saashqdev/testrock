import { Metadata } from "next";
import { KnowledgeBaseDto } from "@/modules/knowledgeBase/dtos/KnowledgeBaseDto";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import KnowledgeBaseService from "@/modules/knowledgeBase/service/KnowledgeBaseService.server";
import KnowledgeBaseTemplatesService from "@/modules/knowledgeBase/service/KnowledgeBaseTemplatesService.server";
import { KnowledgeBasesTemplateDto } from "@/modules/knowledgeBase/dtos/KnowledgeBasesTemplateDto";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import KnowledgeBasesClient from "../KnowledgeBasesClient";

type LoaderData = {
  metatags: MetaTagsDto;
  items: KnowledgeBaseDto[];
  template: KnowledgeBasesTemplateDto;
};

export const metadata: Metadata = {
  title: "Knowledge Base",
};

async function getKnowledgeBasesData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  await verifyUserHasPermission("admin.kb.view");
  const data: LoaderData = {
    metatags: [{ title: `Knowledge Base` }],
    items: await KnowledgeBaseService.getAll({ request }),
    template: await KnowledgeBaseTemplatesService.getTemplate(),
  };
  return data;
}


export default async function KnowledgeBasesPage(props: IServerComponentsProps) {
  const data = await getKnowledgeBasesData(props);
  
  return <KnowledgeBasesClient data={data} />;
}
