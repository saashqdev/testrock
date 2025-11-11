import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { db } from "@/db";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import FormulasPageClient from "./FormulasPageClient";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Formulas | ${process.env.APP_NAME}`,
  };
}

export default async function FormulasPage(props: IServerComponentsProps) {
  const request = props.request!;
  const params = (await props.params) || {};
  
  await verifyUserHasPermission("admin.formulas.view");
  const tenantId = await getTenantIdOrNull({ request, params });
  
  const items = await db.formulas.getAllFormulas();
  const logs = await db.formulaLogs.countLogs(items.map((item) => item.id ?? ""));
  const allEntities = await db.entities.getAllEntities(null);
  
  const initialData = {
    title: `Formulas | ${process.env.APP_NAME}`,
    items: items.map((item) => FormulaHelpers.getFormulaDto(item)),
    logs,
    allEntities,
  };

  return <FormulasPageClient initialData={initialData} />;
}
