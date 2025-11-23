import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import PropertyForm from "@/components/entities/properties/PropertyForm";
import { PropertyWithDetailsDto, EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  properties: PropertyWithDetailsDto[];
  formulas: FormulaDto[];
  entities: EntityWithDetailsDto[];
};

export default async function NewEntityPropertyRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const entity = await db.entities.getEntityBySlug({ tenantId, slug: params.entity ?? "" });
  const entities = await db.entities.getAllEntities(null);

  const data: LoaderData = {
    entity,
    properties: entity?.properties ?? [],
    formulas: (await db.formulas.getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula)),
    entities,
  };

  return <PropertyForm properties={data.properties} entities={data.entities} formulas={data.formulas} />;
}
