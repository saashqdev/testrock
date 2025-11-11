import EntitiesSingleton from "../EntitiesSingleton";
import { db } from "@/db";

export async function loadEntities() {
  const instance = EntitiesSingleton.getInstance();
  if (!instance.isSet()) {
    const entities = await db.entities.getAllEntities(null);
    instance.setEntities(entities);
  }
  return instance.getEntities();
}
