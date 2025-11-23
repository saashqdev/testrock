import { redirect } from "next/navigation";
import { Metadata } from "next";
import { db } from "@/db";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import UrlUtils from "@/utils/app/UrlUtils";
import PortalServer from "@/modules/portals/services/Portal.server";
import DomainsServer from "@/modules/domains/services/Domains.server";
import { GetCertDto } from "@/modules/domains/dtos/GetCertDto";
import { PortalWithDetailsDto } from "@/db/models/portals/PortalsModel";
import { revalidatePath } from "next/cache";
import DomainsClient from "./domains-client";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Domain | ${process.env.APP_NAME}`,
  };
}

type PageData = {
  item: PortalWithDetailsDto;
  certificate: GetCertDto | null;
  portalUrl: string;
};

async function getData(props: IServerComponentsProps): Promise<PageData> {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;

  await requireAuth();

  await DomainsServer.getConfig({ request }).catch((e) => {
    throw new Error(e.message);
  });

  const tenantId = await getTenantIdOrNull({ request, params });
  const item = await db.portals.getPortalById(tenantId, params.portal!);

  if (!item) {
    redirect(UrlUtils.getModulePath(params, "portals"));
  }

  const certificate = await DomainsServer.getCert({ hostname: item.domain, request });
  const portalUrl = PortalServer.getPortalUrl(item);

  return {
    item,
    certificate,
    portalUrl,
  };
}

export default async function DomainsPage(props: IServerComponentsProps) {
  const resolvedParams = await props.params;
  const params = resolvedParams || {};
  const request = props.request!;

  const data = await getData(props);

  // Server Actions
  async function editDomain(formData: FormData) {
    "use server";

    const { t } = await getServerTranslations();
    const domain = formData.get("domain")?.toString().toLowerCase().trim().replace("http://", "").replace("https://", "");

    if (domain) {
      const existingDomain = await db.portals.getPortalByDomain(domain);
      if (existingDomain) {
        return { error: "Domain taken" };
      }
      await DomainsServer.addCert({ hostname: domain, request });
    }

    if (!data.item) {
      return { error: "Portal not found" };
    }

    await db.portals.updatePortal(data.item.id, { domain });
    revalidatePath(`/app/${params.tenant}/portals/${params.portal}/domains`);

    return { success: t("shared.saved") };
  }

  async function checkDomain() {
    "use server";

    if (!data.item?.domain) {
      return { error: "No domain configured" };
    }

    const cert = await DomainsServer.getCert({ hostname: data.item.domain, request });

    if (cert?.configured) {
      revalidatePath(`/app/${params.tenant}/portals/${params.portal}/domains`);
      return { success: "Domain verified" };
    }

    return { error: "Domain not verified" };
  }

  async function deleteDomain() {
    "use server";

    const { t } = await getServerTranslations();

    if (!data.item?.domain) {
      return { error: "No domain configured" };
    }

    await DomainsServer.delCert({ hostname: data.item.domain, request });
    await db.portals.updatePortal(data.item.id, { domain: null });
    revalidatePath(`/app/${params.tenant}/portals/${params.portal}/domains`);

    return { success: t("shared.deleted") };
  }

  return <DomainsClient data={data} params={params} editDomain={editDomain} checkDomain={checkDomain} deleteDomain={deleteDomain} />;
}
