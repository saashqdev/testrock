import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import CrmService from "@/modules/crm/services/CrmService";
import CrmSyncClient from "./CrmSyncClient";
import { syncAction } from "./actions";
import { Metadata } from "next";

type LoaderData = {
  users: Awaited<ReturnType<typeof CrmService.getUsersInCrm>>;
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const params = (await props.params) || {};
  await requireAuth();
  await getTenantIdOrNull({ request, params });
  const searchParams = new URL(request.url).searchParams;
  const usersInCrm = await CrmService.getUsersInCrm({
    invalidateCache: searchParams.get("cache") === "clear",
  });
  const data: LoaderData = {
    users: usersInCrm,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `CRM Sync | ${process.env.APP_NAME}`,
  };
}

export default async function CrmSyncPage(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  return <CrmSyncClient users={data.users} syncAction={syncAction} />;
}
