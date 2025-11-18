import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import UrlUtils from "@/utils/app/UrlUtils";
import EditPropertyClient from "./EditPropertyClient";

export default async function EditEntityPropertyRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  const item = await db.properties.getProperty(params.id ?? "");
  
  if (!item) {
    redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
  }

  const properties = entity?.properties ?? [];
  const formulas = (await db.formulas.getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula));
  const entities = await db.entities.getAllEntities(null, true);

  return <EditPropertyClient item={item} properties={properties} entities={entities} formulas={formulas} />;
}
