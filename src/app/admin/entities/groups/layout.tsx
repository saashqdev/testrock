import { ReactNode } from "react";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import EntityGroupsClient from "./GroupsClient";

async function getData() {
  await verifyUserHasPermission("admin.entities.view");
  const items = await db.entityGroups.getAllEntityGroups();
  return { items };
}

export default async function GroupsLayout({ children }: { children: ReactNode }) {
  const data = await getData();
  
  return <EntityGroupsClient items={data.items}>{children}</EntityGroupsClient>;
}
