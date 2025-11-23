import { redirect } from "next/navigation";
import { ReactNode } from "react";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";

type LayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function BuilderLayout({ children, params }: LayoutProps) {
  const resolvedParams = await params;
  const item = await db.promptFlows.getPromptFlow(resolvedParams.id);
  await verifyUserHasPermission("admin.prompts.view");

  if (!item) {
    redirect("/admin/prompts/builder");
  }

  return (
    <EditPageLayout
      title={item.title}
      menu={[
        { title: "Prompts", routePath: "/admin/prompts/builder" },
        { title: item.title, routePath: `/admin/prompts/builder/${item.id}` },
      ]}
      withHome={false}
    >
      {children}
    </EditPageLayout>
  );
}
