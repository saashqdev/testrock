import { getAll, get, create, del } from "@/utils/api/server/RowsApi";
import RowHelper, { RowValueCreateDto } from "@/lib/helpers/RowHelper";
import EntitiesSingleton from "./EntitiesSingleton";
import RowRepository from "./RowRepository.server";

export default class EntityRepository {
  session: { tenantId: string | null; userId?: string };
  constructor(options: { session: { tenantId: string | null; userId?: string } }) {
    this.session = options?.session;
  }
  async getRows(entityName: string) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    const entity = allEntities.find((entity) => entity.name === entityName);
    if (!entity) {
      throw new Error("Entity not found: " + entityName);
    }
    const { items } = await getAll({
      entity,
      tenantId: this.session.tenantId,
      userId: this.session?.userId,
    });
    return items.map((row) => new RowRepository(row));
  }
  async getRow(entityName: string, rowId: string) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    const entity = allEntities.find((entity) => entity.name === entityName);
    if (!entity) {
      throw new Error("Entity not found: " + entityName);
    }
    const existing = await get(rowId, {
      entity,
      tenantId: this.session.tenantId,
      userId: this.session?.userId,
    });
    return new RowRepository(existing.item);
  }
  async createRow(entityName: string, values: RowValueCreateDto[]) {
    const allEntities = EntitiesSingleton.getInstance().getEntities();
    const entity = allEntities.find((entity) => entity.name === entityName);
    if (!entity) {
      throw new Error("Entity not found: " + entityName);
    }
    const row = await create({
      entity,
      tenantId: this.session.tenantId,
      userId: this.session?.userId,
      rowValues: RowHelper.getRowPropertiesFromForm({
        entity,
        values,
      }),
    });
    return new RowRepository(row);
  }
  async deleteRow(entityName: string, rowId: string, options = { checkPermissions: true }) {
    return del(rowId, {
      entity: { name: entityName },
      tenantId: this.session.tenantId,
      userId: this.session?.userId,
      checkPermissions: options.checkPermissions,
    });
  }
}
