import { redirect } from "next/navigation";
import { prisma } from "@/db/config/prisma/database";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { defaultTheme } from "@/utils/theme/defaultThemes";
import { db } from "@/db";
import { WidgetDto } from "@/modules/widgets/dtos/WidgetDto";
import WidgetUtils from "@/modules/widgets/utils/WidgetUtils";
import JsonPropertiesUtils from "@/modules/jsonProperties/utils/JsonPropertiesUtils";
import UrlUtils from "@/utils/app/UrlUtils";
import WidgetsClient from "./widgets-client";

export type LoaderData = {
  items: WidgetDto[];
};

export type ActionData = {
  success?: string;
  error?: string;
};

interface WidgetsPageProps {
  params: Promise<{ tenant: string }>;
}

// Server Component - handles data fetching
export default async function WidgetsPage({ params }: WidgetsPageProps) {
  const { tenant } = await params;
  const tenantId = await getTenantIdFromUrl({ tenant });
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  
  const items = (await prisma.widget.findMany({ where: { tenantId } })).map((f) => WidgetUtils.toDto(f));
  
  const data: LoaderData = {
    items,
  };

  return <WidgetsClient data={data} appConfiguration={appConfiguration} />;
}

// Server Action for creating widgets
export async function POST(request: Request, { params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params;
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const tenantId = await getTenantIdFromUrl({ tenant });
  const formData = await request.formData();
  const name = formData.get("name")?.toString() || "";
  const metadata = JsonPropertiesUtils.getValuesFromForm({
    form: formData,
    properties: appConfiguration.widgets?.metadata || [],
    prefix: "metadata",
  });
  
  const existing = await prisma.widget.findUnique({
    where: {
      tenantId_name: { tenantId, name },
    },
  });
  
  if (existing) {
    return Response.json({ error: "Name already taken" }, { status: 400 });
  }
  
  const appearance: WidgetDto["appearance"] = {
    logo: null,
    theme: defaultTheme,
    mode: "light",
    position: "bottom-right",
    hiddenInUrls: [],
    visibleInUrls: [],
  };
  
  const item = await prisma.widget.create({
    data: {
      name,
      tenantId,
      metadata: JSON.stringify(metadata),
      appearance: JSON.stringify(appearance),
    },
  });
  
  return Response.json({ 
    success: true,
    redirectUrl: UrlUtils.getModulePath({ tenant }, `widgets/${item.id}`)
  });
}
