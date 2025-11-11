import { Metadata } from "next";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { headers } from "next/headers";
import EntityGroupsClient from "./GroupsClient";

type PageData = {
  title: string;
  items: EntityGroupWithDetailsDto[];
};

async function getData(): Promise<PageData> {
  const headersList = await headers();
  const request = new Request("http://localhost", {
    headers: headersList,
  });
  
  await verifyUserHasPermission("admin.entities.view");
  const items = await db.entityGroups.getAllEntityGroups();
  
  return {
    title: `Entity Groups | ${process.env.APP_NAME}`,
    items,
  };
}

export async function generateMetadata(): Promise<Metadata> {
  const data = await getData();
  return {
    title: data.title,
  };
}

export default async function EntityGroupsPage() {
  const data = await getData();
  
  return <EntityGroupsClient items={data.items} />;
}
