import { redirect } from "next/navigation";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { Colors } from "@/lib/enums/shared/Colors";
import PropertyForm from "@/components/entities/properties/PropertyForm";
import { getServerTranslations } from "@/i18n/server";
import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import UrlUtils from "@/utils/app/UrlUtils";
import { PropertyWithDetailsDto, EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { validateProperty } from "@/lib/helpers/PropertyHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type LoaderData = {
  entity: EntityWithDetailsDto;
  item: PropertyWithDetailsDto;
  formulas: FormulaDto[];
  entities: EntityWithDetailsDto[];
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const params = (await props.params) || {};
  const request = props.request!;  
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });
  const item = await db.properties.getProperty(params.id ?? "");
  if (!item) {
    redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
  }
  const entities = await db.entities.getAllEntities(null, true);
  const data: LoaderData = {
    entity,
    item,
    formulas: (await db.formulas.getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula)),
    entities,
  };
  return data;
}

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;  
  await verifyUserHasPermission("admin.entities.update");
  const { t } = await getServerTranslations();

  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity ?? "" });

  const existing = await db.properties.getProperty(params.id ?? "");

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("name")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const type = Number(form.get("type")) as PropertyType;
  const subtype = form.get("subtype")?.toString() ?? null;
  const order = Number(form.get("order"));
  let isRequired = Boolean(form.get("is-required"));
  const isHidden = Boolean(form.get("is-hidden"));
  const isDisplay = Boolean(form.get("is-display"));
  const isReadOnly = Boolean(form.get("is-read-only"));
  const canUpdate = Boolean(form.get("can-update"));
  let showInCreate = Boolean(form.get("show-in-create"));
  let formulaId = form.get("formula-id")?.toString() ?? null;

  if (["id", "folio", "createdAt", "createdByUser", "sort", "page", "q", "v", "redirect", "tags"].includes(name)) {
    return badRequest({ error: name + " is a reserved property name" });
  }

  const options: { order: number; value: string; name?: string; color?: Colors }[] = form.getAll("options[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  const attributes: { name: string; value: string }[] = form.getAll("attributes[]").map((f: FormDataEntryValue) => {
    return JSON.parse(f.toString());
  });

  if ([PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(type) && options.length === 0) {
    // return badRequest({ error: "Add at least one option" });
  }

  if (type !== PropertyType.FORMULA) {
    formulaId = null;
  } else {
    isRequired = false;
  }
  if ([PropertyType.FORMULA].includes(type) && !formulaId) {
    return badRequest({ error: "Select a formula" });
  }

  const errors = await validateProperty(name, title, entity.properties, existing);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "edit") {
    try {
      if (name?.includes(" ")) {
        throw Error("Property names cannot contain spaces");
      }
      if (name?.includes("-")) {
        throw Error("Property names cannot contain: -");
      }
      await db.properties.updateProperty(params.id ?? "", {
        name,
        title,
        type,
        subtype,
        order,
        isDefault: existing?.isDefault ?? false,
        isRequired,
        isHidden,
        isDisplay,
        isReadOnly,
        canUpdate,
        showInCreate,
        formulaId,
      });
      await db.properties.updatePropertyOptions(params.id ?? "", options);
      await db.properties.updatePropertyAttributes(params.id ?? "", attributes);
      return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  } else if (action === "delete") {
    await verifyUserHasPermission("admin.entities.delete");
    const id = form.get("id")?.toString() ?? "";
    const existingProperty = await db.properties.getProperty(id);
    if (!existingProperty) {
      return badRequest({ error: t("shared.notFound") });
    }
    await db.properties.deleteProperty(id);
    return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function EditEntityPropertyRoute(props: IServerComponentsProps) {
  const data = await getLoaderData(props);
  return <PropertyForm item={data.item} properties={[]} entities={data.entities} formulas={data.formulas} />;
}
