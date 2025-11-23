import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { getCurrentPage } from "@/modules/pageBlocks/services/server/pagesService";
import CrmService from "@/modules/crm/services/CrmService";
import { ContactPageClient } from "./ContactPageClient";
import ServerError from "@/components/ui/errors/ServerError";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { toClientData } from "@/modules/pageBlocks/dtos/PageBlockData";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const request = props.request!;
  const params = (await props.params) || {};
  const page = await getCurrentPage({ request, params, slug: "/contact" });
  return (page?.metatags || {}) as Metadata;
}

export default async function ContactRoute(props: IServerComponentsProps) {
  const request = props.request!;
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();
  const page = await getCurrentPage({ request, params, slug: "/contact" });
  const settings = await CrmService.getContactFormSettings();

  const data = {
    ...page,
    settings,
  };

  return <ContactPageClient data={toClientData(data) as any} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
