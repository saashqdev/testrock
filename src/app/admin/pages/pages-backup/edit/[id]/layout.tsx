import { redirect } from "next/navigation";
import { ReactNode } from "react";
import { getPageConfiguration } from "@/modules/pageBlocks/services/server/pagesService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import PageEditClient from "./client-layout";

export default async function PageEditLayout({ children, params }: { children: ReactNode; params: Promise<{ id: string }> }) {
  const { id } = await params;

  await verifyUserHasPermission("admin.pages.update");
  const item = await db.pages.getPage(id);
  if (!item) {
    redirect("/admin/pages");
  }

  const mockRequest = new Request("http://localhost");
  const page = await getPageConfiguration({ request: mockRequest, page: item, slug: item.slug });

  return (
    <PageEditClient page={page} id={id}>
      {children}
    </PageEditClient>
  );
}
