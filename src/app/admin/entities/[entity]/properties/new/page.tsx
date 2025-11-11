import { redirect } from "next/navigation";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { Colors } from "@/lib/enums/shared/Colors";
import PropertyForm from "@/components/entities/properties/PropertyForm";
import { getServerTranslations } from "@/i18n/server";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import { PropertiesApi } from "@/utils/api/server/PropertiesApi";
import UrlUtils from "@/utils/app/UrlUtils";
import { PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { validateProperty } from "@/lib/helpers/PropertyHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

type ActionData = {
  error?: string;
  properties?: PropertyWithDetailsDto[];
};
const success = (data: ActionData) => Response.json(data, { status: 200 });
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const { t } = await getServerTranslations();

  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });

  const form = await request.formData();
  const action = form.get("action")?.toString() ?? "";
  const name = form.get("name")?.toString() ?? "";
  const title = form.get("title")?.toString() ?? "";
  const type = Number(form.get("type")) as PropertyType;
  const subtype = form.get("subtype")?.toString() ?? null;
  const order = Number(form.get("order"));
  const isDefault = Boolean(form.get("is-default"));
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
    showInCreate = false;
  }
  if ([PropertyType.FORMULA].includes(type) && !formulaId) {
    return badRequest({ error: "Select a formula" });
  }

  const errors = await validateProperty(name, title, entity.properties);
  if (errors.length > 0) {
    return badRequest({ error: errors.join(", ") });
  }

  if (action === "create") {
    try {
      await PropertiesApi.create({
        entityId: entity.id,
        name,
        title,
        type,
        subtype,
        order,
        isDefault,
        isRequired,
        isHidden,
        isDisplay,
        isReadOnly,
        canUpdate,
        showInCreate,
        formulaId,
        options,
        attributes,
        tenantId: null,
      });
      return redirect(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
    } catch (e: any) {
      return badRequest({ error: e.message });
    }
  }
  return badRequest({ error: t("shared.invalidForm") });
};

export default async function NewEntityPropertyRoute(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const entity = await db.entities.getEntityBySlug({ tenantId: null, slug: params.entity! });
  
  const properties = entity?.properties ?? [];
  const formulas = (await db.formulas.getAllFormulas()).map((formula) => FormulaHelpers.getFormulaDto(formula));
  
  // Fetch app or admin data directly
  const entities = await db.entities.getAllEntities(null);

  return <PropertyForm properties={properties} entities={entities} formulas={formulas} />;
}
