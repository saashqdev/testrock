import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

export default class EntitiesSingleton {
  private static instance: EntitiesSingleton;
  private entities: EntityWithDetailsDto[] | undefined;
  private constructor(entities?: EntityWithDetailsDto[]) {
    this.entities = entities;
  }
  public static getInstance(entities?: EntityWithDetailsDto[]): EntitiesSingleton {
    if (!EntitiesSingleton.instance) {
      EntitiesSingleton.instance = new EntitiesSingleton(entities);
    }
    return EntitiesSingleton.instance;
  }
  public isSet() {
    return this.entities !== undefined;
  }
  public getEntities(): EntityWithDetailsDto[] {
    if (!this.entities) {
      throw new Error("Entities not set: Call await EntitiesSingleton.load() before using RowRepository or EntityRepository");
    }
    return this.entities;
  }
  public setEntities(entities: EntityWithDetailsDto[]): void {
    const instance = EntitiesSingleton.getInstance();
    instance.entities = entities;
  }
  public static getEntity(data: { name: string } | { id: string }): EntityWithDetailsDto {
    const entities = EntitiesSingleton.getInstance().getEntities();
    if ("name" in data) {
      const entity = entities.find((f) => f.name === data.name);
      if (!entity) {
        throw new Error("Entity not found: " + data.name);
      }
      return entity;
    } else {
      const entity = entities.find((f) => f.id === data.id);
      if (!entity) {
        throw new Error("Entity not found: " + data.id);
      }
      return entity;
    }
  }
  public static getEntityByIdNameOrSlug(idNameOrSlug: string) {
    const entity = EntitiesSingleton.getInstance()
      .getEntities()
      .find((f) => f.id === idNameOrSlug || f.name === idNameOrSlug || f.slug === idNameOrSlug);
    if (!entity) {
      throw new Error(`Entity not found`);
    }
    return entity;
  }
}
