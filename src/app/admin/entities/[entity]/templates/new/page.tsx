import { Metadata } from "next";
import NewEntityTemplateClient from "./NewEntityTemplateClient";
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
  
  // Admin routes don't have a tenant context
  const tenantId = null;
  
  const entity = await db.entities.getEntityBySlug({ 
    tenantId, 
    slug: resolvedParams.entity ?? "" 
  });

  return <NewEntityTemplateClient entity={entity} entitySlug={resolvedParams.entity} />;
}
