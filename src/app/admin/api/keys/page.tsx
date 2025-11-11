import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import Component from "./component";

type LoaderData = {
  apiKeys: ApiKeyWithDetailsDto[];
};

const loader = async () => {
  await verifyUserHasPermission("admin.apiKeys.view");
  const apiKeys = await db.apiKeys.getAllApiKeys();
  const data: LoaderData = {
    apiKeys,
  };
  return data;
};

export default async function AdminApiKeysRoute() {
  const data = await loader();
  return <Component data={data} />;
}
