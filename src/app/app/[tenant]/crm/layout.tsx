import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import CrmService from "@/modules/crm/services/CrmService";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import CrmLayoutClient from "./CrmLayoutClient";

type LoaderData = {
  title: string;
};

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const data: LoaderData = {
    title: `CRM | ${process.env.APP_NAME}`,
  };
  const tenantId = await getTenantIdOrNull({ request, params });
  await CrmService.validate(tenantId);
  return data;
};

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  return {
    title: data.title,
  };
}

export default function CrmLayout({ children }: { children: React.ReactNode }) {
  return <CrmLayoutClient>{children}</CrmLayoutClient>;
}

export function ErrorBoundary() {
  return <ServerError />;
}
