import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import MonacoEditorClient from "./monaco-editor.client";

export default async function PlaygroundMonacoEditorPage(props: IServerComponentsProps) {
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const allEntities = await db.entities.getAllEntities(null);

  return <MonacoEditorClient allEntities={allEntities} />;
}
