import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PageConfiguration } from "../../dtos/PageConfiguration";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { PageWithDetailsDto } from "@/db/models/pageBlocks/PagesModel";
import { db } from "@/db";

export namespace PageSettings_Index {
  export type LoaderData = {
    page: PageWithDetailsDto;
  };
  export const loader = async (props: IServerComponentsProps) => {
    const params = (await props.params) || {};
    const request = props.request!;
    await verifyUserHasPermission("admin.pages.view");
    const page = await db.pages.getPage(params.id!);
    if (!page) {
      return redirect(params.tenant ? `/app/${params.tenant}/settings/pages` : "/admin/pages");
    }
    const data: LoaderData = {
      page,
    };
    return data;
  };

  export type ActionData = {
    success: string;
    error: string;
    page?: PageConfiguration;
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
      return redirect(params.tenant ? `/app/${params.tenant}/settings/pages` : "/admin/pages");
    }

    if (action === "update") {
      const isPublished = form.get("isPublished");
      const isPublic = form.get("isPublic");
      await db.pages.updatePage(item, {
        isPublished: isPublished === "true" || isPublished === "on",
        isPublic: isPublic === "true" || isPublic === "on",
      });
      return Response.json({ success: "Page updated successfully" });
    } else if (action === "delete") {
      await verifyUserHasPermission("admin.pages.delete");
      if (item.blocks.length > 0) {
        return Response.json({ error: "Page has custom blocks, please delete them first" }, { status: 400 });
      }
      if (item.metaTags.length > 0) {
        return Response.json({ error: "Page has meta tags, please delete them first" }, { status: 400 });
      }
      await db.pageMetaTags.deleteMetaTags(item);
      await db.pages.deletePage(item.id);
      return redirect(params.tenant ? `/app/${params.tenant}/settings/pages` : "/admin/pages");
    } else {
      return Response.json({
        error: t("shared.invalidForm"),
      });
    }
  };
}
