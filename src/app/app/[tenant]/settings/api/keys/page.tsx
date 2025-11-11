import { DefaultFeatures } from "@/lib/dtos/shared/DefaultFeatures";
import { PlanFeatureUsageDto } from "@/lib/dtos/subscriptions/PlanFeatureUsageDto";
import { ApiKeyWithDetailsDto } from "@/db/models/apiKeys/ApiKeysModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getPlanFeatureUsage } from "@/utils/services/server/subscriptionService";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { ApiKeysClientPage } from "./component";

type PageData = {
  apiKeys: ApiKeyWithDetailsDto[];
  featurePlanUsage: PlanFeatureUsageDto | undefined;
};

export default async function AdminApiKeysRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdFromUrl(params);
  await verifyUserHasPermission("app.settings.apiKeys.view", tenantId);
  const apiKeys = await db.apiKeys.getApiKeys(tenantId);
  const featurePlanUsage = await getPlanFeatureUsage(tenantId, DefaultFeatures.API);
  
  const data: PageData = {
    apiKeys,
    featurePlanUsage,
  };

  return <ApiKeysClientPage data={data} />;
}
