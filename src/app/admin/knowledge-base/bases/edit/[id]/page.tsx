import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import { redirect } from "next/navigation";
import EditKnowledgeBaseClient from "./EditKnowledgeBaseClient";
import ServerError from "@/components/ui/errors/ServerError";

export const metadata: Metadata = {
  title: "Edit Knowledge Base",
};

export default async function EditKnowledgeBasePage(props: IServerComponentsProps) {
  await verifyUserHasPermission("admin.kb.update");
  
  const params = await props.params;
  const id = params?.id as string;
  
  if (!id) {
    redirect("/admin/knowledge-base/bases");
  }
  
  const knowledgeBase = await db.knowledgeBase.getKnowledgeBaseById(id);
  
  if (!knowledgeBase) {
    redirect("/admin/knowledge-base/bases");
  }
  
  return <EditKnowledgeBaseClient knowledgeBase={knowledgeBase} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
