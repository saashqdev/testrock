import { Metadata } from "next";
import { headers } from "next/headers";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import NewEntityTemplateClient from "../NewEntityTemplateClient";
import { db } from "@/db";

type Props = {
  params: Promise<{ entity: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `Templates | ${process.env.APP_NAME}`,
  };
}

export default async function NewEntityTemplatePage({ params }: Props) {
  const resolvedParams = await params;
  const headersList = await headers();
  
  const request = {
    headers: headersList,
  } as Request;

  const tenantId = await getTenantIdOrNull({ 
    request, 
    params: resolvedParams 
  });
  
  const entity = await db.entities.getEntityBySlug({ 
    tenantId, 
    slug: resolvedParams.entity ?? "" 
  });

  return <NewEntityTemplateClient entity={entity} entitySlug={resolvedParams.entity} />;
}
