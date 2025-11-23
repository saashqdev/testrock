import { redirect } from "next/navigation";
import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import UrlUtils from "@/utils/app/UrlUtils";
import { PropertyWithDetailsDto, EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import EditEntityPropertyClient from "./component";

type LoaderData = {
  entity: EntityWithDetailsDto;
  item: PropertyWithDetailsDto;
  formulas: FormulaDto[];
};

export default async function EditEntityPropertyRoute(props: IServerComponentsProps) {
  await requireAuth();
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdOrNull({ request, params });

  const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const item = await db.properties.getProperty(params.id ?? "");

  if (!item || item.tenantId !== tenantId) {
    redirect(UrlUtils.getModulePath(params, `entities/${params.entity}`));
  }

  const data: LoaderData = {
    entity,
    item,
    formulas: (await db.formulas.getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula)),
  };

  return <EditEntityPropertyClient data={data} />;
}
