import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import { PageBlockActionArgs } from "@/modules/pageBlocks/dtos/PageBlockActionArgs";
import { PageBlockLoaderArgs } from "@/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { get, getNoCodeRoutes } from "@/utils/api/server/EntitiesApi";
import { getRelationshipRows, create as createRow } from "@/utils/api/server/RowsApi";
import { getEntityPermission } from "@/lib/helpers/PermissionsHelper";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import RowHelper from "@/lib/helpers/RowHelper";
import { getUserInfo } from "@/lib/services/session.server";
import { getValue } from "../../../shared/variables/BlockVariableService.server";
import { RowsNewBlockData } from "./RowsNewBlockUtils";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { db } from "@/db";

export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<RowsNewBlockData> {
  const entityName = getValue({ request, params, variable: block?.rowsNew?.variables?.entityName });
  const tenantId = getValue({ request, params, variable: block?.rowsNew?.variables?.tenantId });

  const userId = (await getUserInfo()).userId;
  const entity = await db.entities.getEntityByName({ tenantId, name: entityName! });
  const entityData = await get({
    entity,
    tenantId,
    userId,
  });
  return {
    entityData,
    allEntities: await db.entities.getAllEntities(null),
    relationshipRows: await getRelationshipRows({ entity, tenantId, userId }),
  };
}
export async function create({ request, params, form }: PageBlockActionArgs) {
  const entityName = form.get("rows-entity")?.toString();
  const tenantId = form.get("rows-tenant")?.toString() ?? null;
  const redirectTo = form.get("rows-redirectTo")?.toString();

  const userInfo = await getUserInfo();
  const entity = await db.entities.getEntityByName({ tenantId, name: entityName! });

  const { t } = await getServerTranslations();
  await verifyUserHasPermission(getEntityPermission(entity, "create"), tenantId);
  const rowValues = RowHelper.getRowPropertiesFromForm({ t, entity, form });
  const newRow = await createRow({
    entity,
    tenantId,
    userId: userInfo.userId,
    rowValues,
    request,
  });
  if (redirectTo) {
    return redirect(redirectTo.replace(":id", newRow.id.toString()));
  }
  const onCreatedRedirect = form.get("onCreatedRedirect");
  if (onCreatedRedirect) {
    if (onCreatedRedirect === "addAnother") {
      return Response.json({ saveAndAdd: true, newRow });
    }
    const routes = EntityHelper.getRoutes({ routes: getNoCodeRoutes({ request, params }), entity, item: newRow });
    if (routes) {
      if (!entity.onCreated || entity.onCreated === "redirectToOverview") {
        return redirect(routes?.overview ?? "");
      } else if (entity.onCreated === "redirectToEdit") {
        return redirect(routes?.edit ?? "");
      } else if (entity.onCreated === "redirectToList") {
        return redirect(routes?.list ?? "");
      } else if (entity.onCreated === "redirectToNew") {
        return Response.json({ newRow, replace: true });
      }
    }
  }
  return Response.json({ newRow });
}
