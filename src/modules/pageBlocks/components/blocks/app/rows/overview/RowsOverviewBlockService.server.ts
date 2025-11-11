import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PageBlockActionArgs } from "@/modules/pageBlocks/dtos/PageBlockActionArgs";
import { PageBlockLoaderArgs } from "@/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { RowsApi } from "@/utils/api/server/RowsApi";
import { getEntityPermission } from "@/lib/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import RowHelper from "@/lib/helpers/RowHelper";
import { getUserInfo } from "@/lib/services/session.server";
import { BlockVariableService } from "../../../shared/variables/BlockVariableService.server";
import { RowsOverviewBlockData } from "./RowsOverviewBlockUtils";
import { db } from "@/db";

export namespace RowsOverviewBlockService {
  export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<RowsOverviewBlockData> {
    const entityName = BlockVariableService.getValue({ request, params, variable: block?.rowsOverview?.variables?.entityName });
    const tenantId = BlockVariableService.getValue({ request, params, variable: block?.rowsOverview?.variables?.tenantId });
    const rowId = BlockVariableService.getValue({ request, params, variable: block?.rowsOverview?.variables?.rowId });

    const userId = (await getUserInfo()).userId;
    const entity = await db.entities.getEntityByName({ tenantId, name: entityName! });
    const rowData = await RowsApi.get(rowId!, {
      entity,
      tenantId,
      userId,
    });
    return {
      rowData,
      relationshipRows: await RowsApi.getRelationshipRows({ entity, tenantId, userId }),
    };
  }
  export async function create({ request, params, form }: PageBlockActionArgs) {
    const entityName = form.get("rows-entity")?.toString();
    const tenantId = form.get("rows-tenant")?.toString() ?? null;

    const userInfo = await getUserInfo();
    const entity = await db.entities.getEntityByName({ tenantId, name: entityName! });

    await verifyUserHasPermission(getEntityPermission(entity, "create"), tenantId);
    const { t } = await getServerTranslations();
    const rowValues = RowHelper.getRowPropertiesFromForm({ t, entity, form });
    const newRow = await RowsApi.create({
      entity,
      tenantId,
      userId: userInfo.userId,
      rowValues,
      request,
    });
    const redirectTo = form.get("redirect")?.toString() || new URL(request.url).searchParams.get("redirect")?.toString();
    if (redirectTo) {
      return redirect(redirectTo);
    }
    return Response.json({ newRow });
  }
}
