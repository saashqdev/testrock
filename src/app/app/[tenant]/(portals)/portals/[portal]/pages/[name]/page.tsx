import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import { Portal, PortalPage } from "@prisma/client";
import { PortalPageConfigDto } from "@/db/models/core/AppPortalConfigurationModel";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import JsonPropertiesUtils from "@/modules/jsonProperties/utils/JsonPropertiesUtils";
import { revalidatePath } from "next/cache";
import PageEditClient from "./page-edit-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Edit Page | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  portal: Portal;
  pageConfig: PortalPageConfigDto;
  page: PortalPage | null;
  portalUrl: string;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;
  
  await requireAuth();
  
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);
  
  if (!portal) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }
  
  const page = await db.portalPages.getPortalPagesByName(portal.id, params.name!);
  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const pageConfig = appConfiguration.portals.pages.find((p) => p.name === params.name);
  
  if (!pageConfig) {
    redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pages`));
  }
  
  const data: LoaderData = {
    portal,
    pageConfig,
    page,
    portalUrl: PortalServer.getPortalUrl(portal),
  };
  
  return data;
}

export default async function PageEditPage(props: IServerComponentsProps) {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;
  
  await requireAuth();
  
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);
  
  if (!portal) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }
  
  const data = await getData(props);

  // Server Action for form submission
  async function submitPageForm(prevState: any, formData: FormData) {
    "use server";
    
    await requireAuth();
    
    const { t } = await getServerTranslations();
    const action = formData.get("action")?.toString();
    
    const tenantId = await getTenantIdOrNull({ request, params });
    const portal = await db.portals.getPortalById(tenantId, params.portal!);
    
    if (!portal) {
      return { error: "Portal not found" };
    }
    
    const appConfiguration = await db.appConfiguration.getAppConfiguration();
    const pageConfig = appConfiguration.portals.pages.find((p) => p.name === params.name);
    
    if (!pageConfig) {
      return { error: "Page configuration not found" };
    }
    
    const page = await db.portalPages.getPortalPagesByName(portal.id, params.name!);
    
    if (action === "edit") {
      const attributes = JsonPropertiesUtils.getValuesFromForm({
        form: formData,
        properties: pageConfig.properties,
      });

      if (!page) {
        await db.portalPages.createPortalPage({
          portalId: portal.id,
          name: params.name!,
          attributes,
        });
      } else {
        await db.portalPages.updatePortalPage(page.id, {
          attributes,
        });
      }
      
      revalidatePath(`/app/${params.tenant}/portals/${params.portal}/pages`);
      return { success: t("shared.updated") };
    } else if (action === "delete") {
      try {
        if (page) {
          await db.portalPages.deletePortalPage(page.id);
        }
        
        revalidatePath(`/app/${params.tenant}/portals/${params.portal}/pages`);
        redirect(UrlUtils.getModulePath(params, `portals/${portal.id}/pages`));
      } catch (e: any) {
        return { error: e.message || "Failed to delete page" };
      }
    } else {
      return { error: t("shared.invalidForm") };
    }
  }

  return <PageEditClient data={data} params={params} submitAction={submitPageForm} />;
}
