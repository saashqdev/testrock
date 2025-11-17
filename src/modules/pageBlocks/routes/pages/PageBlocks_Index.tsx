import { redirect } from "next/navigation";
import { PageBlockDto } from "@/modules/pageBlocks/dtos/PageBlockDto";
import { getServerTranslations } from "@/i18n/server";
import { PageConfiguration } from "../../dtos/PageConfiguration";
import { getPageConfiguration } from "../../services/server/pagesService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export type LoaderData = {
  page: PageConfiguration;
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.pages.view");
  const { t } = await getServerTranslations();
  const item = await db.pages.getPage(params.id!);
  if (!item) {
    return redirect("/admin/pages");
  }
  const page = await getPageConfiguration({ request, t, page: item, slug: item.slug });
  const data: LoaderData = {
    page,
  };
  return data;
};

export type ActionData = {
  success: string;
  error: string;
  page?: PageConfiguration;
  aiGeneratedBlocks?: PageBlockDto[];
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.pages.update");
  const { t } = await getServerTranslations();
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await db.pages.getPage(params.id!);
  if (!item) {
    return redirect("/admin/pages");
  }
  // const page = await getPageConfiguration({ request, t, page: item, slug: item.slug });

  if (action === "save") {
    const blocks = form.get("blocks");
    try {
      const parsed = JSON.parse(blocks?.toString() ?? "[]") as PageBlockDto[];
      await db.pageBlocks.deletePageBlocks(item);
      await Promise.all(
        parsed.map(async (block, idx) => {
          const keys = Object.keys(block);
          if (keys.length === 0) {
            throw new Error("Invalid block type: " + JSON.stringify(block));
          }
          const type = keys[0];
          return await db.pageBlocks.createPageBlock({
            pageId: item.id,
            order: idx + 1,
            type,
            value: JSON.stringify(block),
          });
        })
      );
      return Response.json({
        success: "Page blocks saved successfully",
      });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "reset") {
    await db.pageBlocks.deletePageBlocks(item);
    return Response.json({
      // success: "Page blocks reset successfully",
      page: await getPageConfiguration({ request, t, slug: item.slug }),
    });
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.pages.delete");
    await db.pageBlocks.deletePageBlocks(item);
    await db.pages.deletePage(item.id);
    return redirect("/admin/pages");
  } else {
    return Response.json({
      error: t("shared.invalidForm"),
    });
  }
};

