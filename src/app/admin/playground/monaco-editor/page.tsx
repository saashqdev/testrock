import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import MonacoEditorClient from "./monaco-editor.client";

export default async function PlaygroundMonacoEditorPage(props: IServerComponentsProps) {
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const allEntities = await db.entities.getAllEntities(null);

  // Serialize entities for client component - convert to plain objects
  const serializedEntities = JSON.parse(JSON.stringify(allEntities));

  return <MonacoEditorClient allEntities={serializedEntities} />;
}
