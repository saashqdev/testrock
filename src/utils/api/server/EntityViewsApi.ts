import { EntityView } from "@prisma/client";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { RowsApi } from "./RowsApi";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { db } from "@/db";

export namespace EntityViewsApi {
  export type GetEntityViewsWithRows = {
    view: EntityViewsWithDetailsDto | undefined;
    rowsData: RowsApi.GetRowsData;
    rowsCount: number;
  };
  export async function getAll({
    entityName,
    tenantId,
    withDefault = true,
    withRows = true,
  }: {
    entityName: string;
    tenantId: string | null;
    withDefault: boolean;
    withRows: boolean;
  }): Promise<GetEntityViewsWithRows[]> {
    const entity = await db.entities.getEntityByName({ tenantId, name: entityName });
    if (!entity) {
      return [];
    }
    const views = await db.entityViews.getEntityViews(entity.id, { tenantId });
    let allViews: (EntityViewsWithDetailsDto | undefined)[] = views;
    if (withDefault) {
      allViews = [undefined, ...views];
    }
    return await Promise.all(
      allViews.map(async (entityView) => {
        let rowsData = await RowsApi.getAll({
          entity,
          tenantId,
          entityView,
          urlSearchParams: new URLSearchParams(),
          pageSize: 10000,
        });
        const rowsCount = rowsData.items.length;
        if (!withRows) {
          rowsData = { ...rowsData, items: [] };
        }
        const data: GetEntityViewsWithRows = {
          view: entityView,
          rowsData,
          rowsCount,
        };
        return data;
      })
    );
  }

  export async function get(
    id: string | undefined,
    { entityName, tenantId, pageSize }: { entityName: string; tenantId: string | null; pageSize?: number }
  ): Promise<GetEntityViewsWithRows | null> {
    const entity = await db.entities.getEntityByName({ tenantId, name: entityName });
    if (!entity) {
      return null;
    }
    let view: EntityViewsWithDetailsDto | null = null;
    if (id) {
      view = await db.entityViews.getEntityView(id);
      if (!view) {
        return null;
      }
    }
    const rowsData = await RowsApi.getAll({
      entity,
      tenantId,
      entityView: view ?? undefined,
      urlSearchParams: new URLSearchParams(),
      pageSize,
    });
    const data: GetEntityViewsWithRows = {
      view: view ?? undefined,
      rowsData,
      rowsCount: rowsData.items.length,
    };
    return data;
  }

  export async function createFromForm({ entity, form, createdByUserId }: { form: FormData; entity: EntityWithDetailsDto; createdByUserId: string }) {
    const layout = form.get("layout")?.toString() ?? "";
    const name = form.get("name")?.toString().toLowerCase() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const pageSize = Number(form.get("pageSize"));
    const isDefault = Boolean(form.get("isDefault"));
    // Board
    const groupBy = form.get("groupBy")?.toString() ?? undefined;
    const groupByPropertyId = form.get("groupByPropertyId")?.toString() ?? undefined;
    // Grid
    const gridColumns = Number(form.get("gridColumns") ?? 0);
    const gridColumnsSm = Number(form.get("gridColumnsSm") ?? 0);
    const gridColumnsMd = Number(form.get("gridColumnsMd") ?? 0);
    const gridColumnsLg = Number(form.get("gridColumnsLg") ?? 0);
    const gridColumnsXl = Number(form.get("gridColumnsXl") ?? 0);
    const gridColumns2xl = Number(form.get("gridColumns2xl") ?? 0);
    const gridGap = form.get("gridGap")?.toString() ?? "sm";

    const isSystem = form.get("isSystem") === "true";
    let tenantId: string | null = form.get("tenantId")?.toString() ?? null;
    let userId: string | null = form.get("userId")?.toString() ?? null;

    if (!tenantId?.toString().trim()) {
      tenantId = null;
    }
    if (!userId?.toString().trim()) {
      userId = null;
    }

    const errors = [
      ...(await validateEntityView({ entityId: entity.id, isDefault, name, title, order: null, userId })),
      ...(await validateGroupBy(entity, layout, groupBy, groupByPropertyId)),
    ];
    if (errors.length > 0) {
      throw Error(errors.join(", "));
    }

    const properties: { propertyId: string; name: string; order: number }[] = form.getAll("properties[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (properties.length === 0) {
      throw Error("Add at least one property to display");
    }

    const filters: { name: string; condition: string; value: string; match: string }[] = form.getAll("filters[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    const sort: { name: string; asc: boolean; order: number }[] = form.getAll("sort[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (tenantId) {
      const tenant = await db.tenants.getTenant(tenantId);
      if (!tenant) {
        // eslint-disable-next-line no-console
        console.log("Invalid account", { tenantId });
        throw Error("Invalid account");
      }
    }
    if (userId) {
      const user = await db.users.getUser(userId);
      if (!user) {
        // eslint-disable-next-line no-console
        console.log("Invalid user", { userId });
        throw Error("Invalid user");
      }
    }
    try {
      const entityView = await db.entityViews.createEntityView({
        entityId: entity.id,
        tenantId: tenantId,
        userId: userId,
        createdByUserId,
        layout,
        name,
        title,
        isDefault,
        pageSize,
        groupByPropertyId: groupBy === "byProperty" ? groupByPropertyId ?? null : null,
        gridColumns,
        gridColumnsSm,
        gridColumnsMd,
        gridColumnsLg,
        gridColumnsXl,
        gridColumns2xl,
        gridGap,
        isSystem,
      });
      await db.entityViews.updateEntityViewProperties(entityView.id, properties);
      await db.entityViews.updateEntityViewFilters(entityView.id, filters);
      await db.entityViews.updateEntityViewSort(entityView.id, sort);

      return entityView;
    } catch (e: any) {
      throw Error(e.message);
    }
  }

  export async function updateFromForm({ item, entity, form }: { item: EntityView; form: FormData; entity: EntityWithDetailsDto }) {
    const layout = form.get("layout")?.toString() ?? "";
    const name = form.get("name")?.toString() ?? "";
    const title = form.get("title")?.toString() ?? "";
    const pageSize = Number(form.get("pageSize"));
    const orderValue = form.get("order");
    const order = orderValue ? Number(orderValue) : null;
    const isDefault = Boolean(form.get("isDefault"));
    // Board
    const groupBy = form.get("groupBy")?.toString() ?? undefined;
    const groupByPropertyId = form.get("groupByPropertyId")?.toString() ?? undefined;
    // Grid
    const gridColumns = Number(form.get("gridColumns") ?? 0);
    const gridColumnsSm = Number(form.get("gridColumnsSm") ?? 0);
    const gridColumnsMd = Number(form.get("gridColumnsMd") ?? 0);
    const gridColumnsLg = Number(form.get("gridColumnsLg") ?? 0);
    const gridColumnsXl = Number(form.get("gridColumnsXl") ?? 0);
    const gridColumns2xl = Number(form.get("gridColumns2xl") ?? 0);
    const gridGap = form.get("gridGap")?.toString() ?? "sm";

    const errors = [
      ...(await validateEntityView({ entityId: entity.id, isDefault, name, title, order, entityView: item, userId: item.userId })),
      ...(await validateGroupBy(entity, layout, groupBy, groupByPropertyId)),
    ];
    if (errors.length > 0) {
      throw Error(errors.join(", "));
    }

    const properties: { propertyId: string; name: string; order: number }[] = form.getAll("properties[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    if (properties.length === 0) {
      throw Error("Add at least one property to display");
    }

    const filters: { name: string; condition: string; value: string; match: string }[] = form.getAll("filters[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    const sort: { name: string; asc: boolean; order: number }[] = form.getAll("sort[]").map((f: FormDataEntryValue) => {
      return JSON.parse(f.toString());
    });

    try {
      const view = await db.entityViews.updateEntityView(item.id, {
        order: order ?? undefined,
        layout,
        name,
        title,
        isDefault,
        pageSize,
        groupByPropertyId: groupBy === "byProperty" ? (groupByPropertyId || null) : null,
        gridColumns,
        gridColumnsSm,
        gridColumnsMd,
        gridColumnsLg,
        gridColumnsXl,
        gridColumns2xl,
        gridGap,
      });
      await db.entityViews.updateEntityViewProperties(item.id, properties);
      await db.entityViews.updateEntityViewFilters(item.id, filters);
      await db.entityViews.updateEntityViewSort(item.id, sort);

      return view;
    } catch (e: any) {
      throw Error(e.message);
    }
  }

  export const getCurrentEntityView = async (entityId: string, urlParams: URLSearchParams) => {
    const name = urlParams.get("v");
    if (name) {
      return await db.entityViews.getEntityViewByName({ entityId, name, isSystem: false });
    } else {
      return await db.entityViews.getEntityViewDefault({ entityId, isSystem: false });
    }
  };

  const validateEntityView = async ({
    entityId,
    isDefault,
    name,
    title,
    order,
    entityView,
    userId,
  }: {
    entityId: string;
    isDefault: boolean;
    name: string;
    title: string;
    order: number | null;
    entityView?: EntityView;
    userId: string | null;
  }) => {
    const errors: string[] = [];

    const views = await db.entityViews.getEntityViews(entityId);
    if (isDefault && userId) {
      const defaultView = views.find((f) => f.id !== entityView?.id && f.isDefault && f.userId === userId);
      if (defaultView) {
        errors.push(`Existing default entity view with title: ${defaultView.title}`);
      }
    }

    if (!entityView || entityView?.name !== name) {
      const existingName = views.find((f) => f.id !== entityView?.id && f.name.toLowerCase() === name.toLowerCase());
      if (existingName) {
        errors.push(`Existing entity view with name: ${existingName.name}`);
      }
    }

    if (!entityView || entityView?.title !== title) {
      const existingTitle = views.find((f) => f.id !== entityView?.id && f.title.toLowerCase() === title.toLowerCase());
      if (existingTitle) {
        errors.push(`Existing entity view with title: ${existingTitle.title}`);
      }
    }

    // if (order) {
    //   if (!entityView || entityView?.order !== order) {
    //     const existingOrder = await getEntityViewByOrder(entityId, order);
    //     if (existingOrder) {
    //       errors.push(`Existing entity view with order '${order}':  ${existingOrder.title}`);
    //     }
    //   }
    // }

    return errors;
  };

  const validateGroupBy = async (entity: EntityWithDetailsDto, layout: string, groupBy: string | undefined, groupByPropertyId: string | undefined) => {
    if (layout !== "board") {
      return [];
    }

    const errors: string[] = [];
    if (groupBy === "byProperty") {
      const property = entity.properties.find((p) => p.id === groupByPropertyId);
      if (!property || property.type !== PropertyType.SELECT) {
        errors.push(`Cannot save a Board view without a SELECT property`);
      }
    }

    return errors;
  };
}
