import NewEntityRelationshipClient from "./NewEntityRelationshipClient";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { createEntityRelationship } from "./actions";
import { db } from "@/db";

type PageData = {
  title: string;
  entity: EntityWithDetailsDto;
  entities: EntityWithDetailsDto[];
};

export default async function NewEntityRelationshipRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  const data: PageData = {
    title: `Relationships | ${process.env.APP_NAME}`,
    entity,
    entities: await db.entities.getAllEntities(null),
  };

  const createEntityRelationshipWithSlug = createEntityRelationship.bind(null, params.entity!);

  return (
    <NewEntityRelationshipClient entity={data.entity} entities={data.entities} entitySlug={params.entity ?? ""} onSubmit={createEntityRelationshipWithSlug} />
  );
}
