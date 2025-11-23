import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { PageConfiguration } from "@/modules/pageBlocks/dtos/PageConfiguration";
import { getPageConfiguration, createDefaultPages } from "@/modules/pageBlocks/services/server/pagesService";
import { defaultPages } from "@/modules/pageBlocks/pages/defaultPages";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { revalidatePath } from "next/cache";
import Component from "./component";

type LoaderData = {
  items: PageConfiguration[];
};

export const loader = async (props: IServerComponentsProps) => {
  const request = props.request!;
  const { t } = await getServerTranslations();
  await verifyUserHasPermission("admin.pages.view");
  const pages = await db.pages.getPages();
  const items = await Promise.all(
    pages.map(async (page) => {
      return {
        ...(await getPageConfiguration({ request, t, page, slug: page.slug })),
        page,
      };
    })
  );
  const sortedItems: PageConfiguration[] = [];
  defaultPages.forEach((defaultPage) => {
    const item = items.find((item) => item.page.slug === defaultPage);
    if (item) {
      sortedItems.push(item);
    }
  });
  items.forEach((item) => {
    if (!sortedItems.find((f) => f.slug === item.page.slug)) {
      sortedItems.push(item);
    }
  });
  const data: LoaderData = {
    items: sortedItems,
  };
  return data;
};

type ActionData = {
  success?: string;
  error?: string;
};

// Server Action for handling form submissions
async function handlePageAction(formData: FormData) {
  "use server";

  const { t } = await getServerTranslations();
  const request = new Request("http://localhost", {
    method: "POST",
    body: formData,
  });

  await verifyUserHasPermission("admin.pages.create");

  const action = formData.get("action")?.toString();

  if (action === "create") {
    const slug = formData.get("slug")?.toString() || "";
    const isSubpage1 = formData.get("isSubpage1")?.toString() === "true";

    if (slug.includes("/")) {
      return { error: "Slug cannot contain /" };
    }

    let finalSlug = "/" + slug;
    if (isSubpage1) {
      finalSlug = finalSlug + "/:id1";
    }

    const existing = await db.pages.getPageBySlug(finalSlug);
    if (existing) {
      return { error: "Slug already exists" };
    }

    const page = await db.pages.createPage({
      slug: finalSlug,
    });

    redirect(`/admin/pages/edit/${page.id}`);
  } else if (action === "create-default") {
    const created = await createDefaultPages();
    if (created.length > 0) {
      revalidatePath("/admin/pages");
      return { success: "Created default pages: " + created.map((f) => f.slug).join(", ") };
    } else {
      return { error: "All default pages already exist: " + defaultPages.join(", ") };
    }
  } else {
    return { error: t("shared.invalidForm") };
  }
}

export default async function Page(props: IServerComponentsProps) {
  const data = await loader(props);
  return <Component data={data} onAction={handlePageAction} />;
}
