import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import PagesClient from "./pages-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Pages | ${process.env.APP_NAME}`,
  };
}

type LoaderData = {
  portal: PortalWithDetailsDto;
  pages: {
    name: string;
    title: string;
    attributes: JsonPropertiesValuesDto | null;
    errors: string[];
    slug: string;
    href: string;
  }[];
  portalUrl: string;
};

async function getData(props: IServerComponentsProps): Promise<LoaderData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;

  await requireAuth();

  const appConfiguration = await db.appConfiguration.getAppConfiguration();
  const tenantId = await getTenantIdOrNull({ request, params });
  const portal = await db.portals.getPortalById(tenantId, params.portal!);

  if (!portal) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const allPages = await db.portalPages.getPortalPages(portal.id);
  const portalUrl = PortalServer.getPortalUrl(portal);

  const pages = appConfiguration.portals.pages.map((page) => {
    const existing = allPages.find((p) => p.name === page.name);
    const attributes = existing ? (existing.attributes as JsonPropertiesValuesDto) : null;

    // Validate page based on type
    let errors: string[] = [];
    if (page.name === "pricing" && !portal.stripeAccountId) {
      errors.push("No Stripe account connected");
    }
    if ((page.name === "privacy-policy" || page.name === "terms-and-conditions") && !attributes?.html) {
      errors.push(`No ${page.title.toLowerCase()} content`);
    }

    return {
      name: page.name,
      title: page.title,
      attributes,
      errors,
      slug: page.slug,
      href: `${portalUrl}${page.slug}`,
    };
  });

  const data: LoaderData = {
    portal,
    pages,
    portalUrl,
  };

  return data;
}

export default async function PagesPage(props: IServerComponentsProps) {
  const data = await getData(props);
  const resolvedParams = await props.params;
  const params = resolvedParams || {};

  return <PagesClient data={data} params={params} />;
}
