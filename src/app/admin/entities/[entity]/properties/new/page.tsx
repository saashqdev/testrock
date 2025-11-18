import { db } from "@/db";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import NewPropertyClient from "@/app/admin/entities/[entity]/properties/new/NewPropertyClient";

export default async function NewEntityPropertyRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  
  if (!entity) {
    return null;
  }

  const properties = entity.properties ?? [];
  const formulas = (await db.formulas.getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula));
  const entities = await db.entities.getAllEntities(null);

  return <NewPropertyClient properties={properties} entities={entities} formulas={formulas} />;
}
