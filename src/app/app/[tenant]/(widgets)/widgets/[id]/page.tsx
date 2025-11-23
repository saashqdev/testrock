import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import JsonPropertiesUtils from "@/modules/jsonProperties/utils/JsonPropertiesUtils";
import { WidgetDto } from "@/modules/widgets/dtos/WidgetDto";
import WidgetUtils from "@/modules/widgets/utils/WidgetUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import { prisma } from "@/db/config/prisma/database";
import { storeSupabaseFile } from "@/utils/integrations/supabaseService";
import { promiseHash } from "@/utils/promises/promiseHash";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getBaseURL } from "@/utils/url.server";
import { db } from "@/db";
import WidgetEditClient from "./WidgetEditClient";

export type LoaderData = {
  item: WidgetDto;
  widgetUrl: string;
};

export type ActionData = {
  success?: string;
  error?: string;
};

interface WidgetEditPageProps {
  params: Promise<{ tenant: string; id: string }>;
}

// Server Component - fetches data and handles actions
export default async function WidgetEditPage({ params }: WidgetEditPageProps) {
  const { tenant, id } = await params;
  const tenantId = await getTenantIdFromUrl({ tenant });
  const item = await prisma.widget.findUnique({
    where: { id },
  });

  if (!item || item.tenantId !== tenantId) {
    redirect(UrlUtils.getModulePath({ tenant }, "widgets"));
  }

  const data: LoaderData = {
    item: WidgetUtils.toDto(item),
    widgetUrl: `<script src="${getBaseURL()}/embed.js" data-widget-id="${item.id}" data-open-delay="-1" defer async />`,
  };

  return <WidgetEditClient data={data} />;
}

// Server Action for handling form submissions
export async function POST(request: Request, { params }: { params: Promise<{ tenant: string; id: string }> }) {
  const { tenant, id } = await params;
  const { t } = await getServerTranslations();
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const tenantId = await getTenantIdFromUrl({ tenant });
  const form = await request.formData();
  const action = form.get("action")?.toString();

  const item = await prisma.widget.findUnique({
    where: { id },
  });

  if (!item || item.tenantId !== tenantId) {
    return redirect(UrlUtils.getModulePath({ tenant }, "widgets"));
  }

  if (action === "edit") {
    const name = form.get("name")?.toString() || "";
    const metadata = JsonPropertiesUtils.getValuesFromForm({
      form,
      properties: appConfiguration.widgets?.metadata || [],
      prefix: "metadata",
    });

    if (name !== item.name) {
      const existing = await prisma.widget.findUnique({
        where: {
          tenantId_name: { tenantId, name },
        },
      });
      if (existing) {
        return Response.json({ error: "Name already taken" }, { status: 400 });
      }
    }
    try {
      await prisma.widget.update({
        where: { id: item.id },
        data: {
          name,
          metadata: JSON.stringify(metadata),
        },
      });
      return Response.json({ success: t("shared.updated") });
    } catch (e: any) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  } else if (action === "edit-branding") {
    const themeColor = form.get("themeColor")?.toString();
    const themeScheme = form.get("themeScheme")?.toString();
    let logo = form.get("logo")?.toString();
    const position = form.get("position")?.toString();
    const placeholder = form.get("placeholder")?.toString();
    const hiddenInUrls = form.getAll("hiddenInUrls[]").map((f) => f.toString());
    const visibleInUrls = form.getAll("visibleInUrls[]").map((f) => f.toString());

    const { storedLogo } = await promiseHash({
      storedLogo: logo ? storeSupabaseFile({ bucket: "widgets", content: logo, id: `${item.id}-logo.png` }) : Promise.resolve(""),
    });

    const appearance: WidgetDto["appearance"] = {
      theme: themeColor || "",
      mode: themeScheme === "light" ? "light" : "dark",
      logo: storedLogo,
      position: position as any,
      hiddenInUrls,
      visibleInUrls,
    };
    await prisma.widget.update({
      where: { id: item.id },
      data: {
        appearance: JSON.stringify(appearance),
      },
    });

    return Response.json({ success: t("shared.saved") });
  } else if (action === "delete") {
    await prisma.widget.delete({
      where: { id: item.id },
    });
    return Response.json({
      success: true,
      redirectUrl: UrlUtils.getModulePath({ tenant }, "widgets"),
    });
  }

  return Response.json({ error: "Invalid action" }, { status: 400 });
}
