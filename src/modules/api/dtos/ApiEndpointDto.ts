import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

export type ApiEndpointDto = {
  entity: EntityWithDetailsDto;
  route: string;
  method: string;
  description: string;
  responseSchema: string;
  bodyExample: string;
};
