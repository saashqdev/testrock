import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { notFound } from "next/navigation";
import CodeGeneratorFilesClient from "./CodeGeneratorFilesClient";

export default async function CodeGeneratorFiles(props: IServerComponentsProps) {
  const params = await props.params;
  const entityName = params.entity as string;
  
  const entity = await db.entities.getEntityByIdOrName({
    tenantId: null,
    name: entityName,
  });
  
  if (!entity) {
    notFound();
  }
  
  return <CodeGeneratorFilesClient entity={entity} />;
}
