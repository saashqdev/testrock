import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { PageWithDetailsDto } from "@/db/models/pageBlocks/PagesModel";
import { db } from "@/db";

export type LoaderData = {
  title: string;
  page: PageWithDetailsDto | null;
  metaTags: { name: string; content: string; order: number }[];
};
export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.pages.view");
  let page: PageWithDetailsDto | null = null;
  if (params.id) {
    page = await db.pages.getPage(params.id);
  } else if (params.tenant) {
    throw redirect(`/app/${params.tenant}/settings/pages`);
  }
  const metaTags = await db.pageMetaTags.getMetaTags(page?.id ?? null);
  const data: LoaderData = {
    title: `SEO | ${process.env.APP_NAME}`,
    metaTags: metaTags.map((tag, idx) => {
      return { name: tag.name, content: tag.value, order: tag.order ?? idx + 1 };
    }),
    page,
  };
  return data;
};

export type ActionData = {
  success: string;
  error: string;
  metaTags?: { name: string; content: string; order: number }[];
};
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  await verifyUserHasPermission("admin.pages.update");
  const { t } = await getServerTranslations();
  const form = await request.formData();
  const action = form.get("action");
  let page: PageWithDetailsDto | null = null;
  if (params.id) {
    page = await db.pages.getPage(params.id);
  }

  if (action === "reset") {
    await db.pageMetaTags.deleteMetaTags(page);
    return Response.json({ success: "Meta tags reset successfully", metaTags: [] });
  } else if (action === "update") {
    const metaTags: { name: string; content: string; order: number }[] = form.getAll("metaTags[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });
    try {
      if (page?.id) {
        for (const { content, order } of metaTags) {
          await db.pageMetaTags.updateMetaTag(page.id, { value: content, order });
        }
      }
      return Response.json({ success: "Meta tags updated successfully", metaTags });
      // return redirect(params.tenant ? `/app/${params.tenant}/settings/pages` : `/admin/pages`);
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else {
    return Response.json({ error: t("shared.invalidForm") }, { status: 400 });
  }
};

