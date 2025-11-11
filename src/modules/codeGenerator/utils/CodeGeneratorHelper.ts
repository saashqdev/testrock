import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function getNames(entity: EntityWithDetailsDto) {
  return {
    capitalized: entity.name.charAt(0).toUpperCase() + entity.name.slice(1),
    name: entity.name,
    title: entity.title,
    plural: entity.titlePlural,
    slug: entity.slug,
  };
}

export default {
  getNames,
};
