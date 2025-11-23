import { PageBlockLoaderArgs } from "@/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { getAll } from "@/utils/api/server/RowsApi";
import { getTenantByIdOrSlug } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { getValue } from "../../../shared/variables/BlockVariableService.server";
import { RowsListBlockData } from "./RowsListBlockUtils";

export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<RowsListBlockData> {
  const entityName = getValue({ request, params, variable: block?.rowsList?.variables?.entityName });
  const tenantId = getValue({ request, params, variable: block?.rowsList?.variables?.tenantId });
  const pageSize = getValue({ request, params, variable: block?.rowsList?.variables?.pageSize });

  const userInfo = await getUserInfo();
  const rowsData = await getAll({
    entity: { name: entityName! },
    tenantId: tenantId ? await getTenantByIdOrSlug(tenantId) : null,
    urlSearchParams: new URL(request.url).searchParams,
    pageSize: pageSize ? Number(pageSize) : undefined,
    userId: userInfo.userId,
  });
  return rowsData;
}
