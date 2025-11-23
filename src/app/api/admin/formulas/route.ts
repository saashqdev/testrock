import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getServerTranslations } from "@/i18n/server";
import { getUserInfo } from "@/lib/services/session.server";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import FormulaService from "@/modules/formulas/services/server/FormulaService";
import FormulaDefaultService from "@/modules/formulas/services/server/FormulaDefaultService";
import { FormulaVariableValueDto } from "@/modules/formulas/dtos/FormulaVariableValueDto";

export async function GET(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.formulas.view");

    const items = await db.formulas.getAllFormulas();
    const logs = await db.formulaLogs.countLogs(items.map((item) => item.id ?? ""));
    const allEntities = await db.entities.getAllEntities(null);

    const data = {
      title: `Formulas | ${process.env.APP_NAME}`,
      items: items.map((item) => FormulaHelpers.getFormulaDto(item)),
      logs,
      allEntities,
    };

    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load formulas" }, { status: error.status || 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await verifyUserHasPermission("admin.entities.update");

    const { t } = await getServerTranslations();
    const userInfo = await getUserInfo();
    const tenantId = await getTenantIdOrNull({ request, params: {} });
    const formData = await request.formData();
    const action = formData.get("action")?.toString();
    const allEntities = await db.entities.getAllEntities(null);

    if (action === "calculate") {
      const id = formData.get("id")?.toString() ?? "";

      const formula = await db.formulas.getFormula(id);
      if (!formula) {
        return NextResponse.json({ error: t("shared.notFound") }, { status: 400 });
      }

      const variables: FormulaVariableValueDto[] = formData.getAll("variables[]").map((variable) => JSON.parse(variable.toString()));

      try {
        const result = await FormulaService.calculate({
          formula,
          variables,
          allEntities,
          session: {
            userId: userInfo.userId,
            tenantId,
          },
          originalTrigger: "",
          triggeredBy: "TEST",
          t,
        });

        return NextResponse.json({ success: result });
      } catch (e: any) {
        return NextResponse.json({ error: e.message }, { status: 400 });
      }
    } else if (action === "createDefault") {
      await verifyUserHasPermission("admin.formulas.create");

      const name = formData.get("name")?.toString();
      const createdDefault = await FormulaDefaultService.createDefault(name);

      return NextResponse.json({ createdDefault });
    } else if (action === "new") {
      await verifyUserHasPermission("admin.formulas.create");

      const name = formData.get("name")?.toString() ?? "";
      const description = formData.get("description")?.toString() ?? "";
      const resultAs = formData.get("resultAs")?.toString();
      const calculationTrigger = formData.get("calculationTrigger")?.toString();
      const withLogs = ["true", "on"].includes(formData.get("withLogs")?.toString() ?? "false");

      const components: { order: number; type: string; value: string }[] = formData.getAll("components[]").map((f) => {
        return JSON.parse(f.toString());
      });

      if (!name || !resultAs || !calculationTrigger) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      if (components.length === 0) {
        return NextResponse.json({ error: "Missing formula components." }, { status: 400 });
      }

      const formula = await db.formulas.createFormula({
        name,
        description,
        resultAs,
        calculationTrigger,
        components,
        withLogs,
      });

      return NextResponse.json({ success: "Formula created successfully", formula });
    } else if (action === "edit") {
      await verifyUserHasPermission("admin.formulas.update");

      const id = formData.get("id")?.toString();
      if (!id) {
        return NextResponse.json({ error: "Missing formula ID" }, { status: 400 });
      }

      const formula = await db.formulas.getFormula(id);
      if (!formula) {
        return NextResponse.json({ error: t("shared.notFound") }, { status: 404 });
      }

      const name = formData.get("name")?.toString() ?? "";
      const description = formData.get("description")?.toString() ?? "";
      const resultAs = formData.get("resultAs")?.toString();
      const calculationTrigger = formData.get("calculationTrigger")?.toString();
      const withLogs = ["true", "on"].includes(formData.get("withLogs")?.toString() ?? "false");

      const components: { order: number; type: string; value: string }[] = formData.getAll("components[]").map((f) => {
        return JSON.parse(f.toString());
      });

      if (!name || !resultAs || !calculationTrigger) {
        return NextResponse.json({ error: "Missing required fields." }, { status: 400 });
      }
      if (components.length === 0) {
        return NextResponse.json({ error: "Missing formula components." }, { status: 400 });
      }

      await db.formulas.updateFormula(id, {
        name,
        description,
        resultAs,
        calculationTrigger,
        withLogs,
        components,
      });

      return NextResponse.json({ success: "Formula updated successfully" });
    } else if (action === "delete") {
      await verifyUserHasPermission("admin.formulas.delete");

      const id = formData.get("id")?.toString();
      if (!id) {
        return NextResponse.json({ error: "Missing formula ID" }, { status: 400 });
      }

      await db.formulas.deleteFormula(id);

      return NextResponse.json({ success: "Formula deleted successfully" });
    } else {
      return NextResponse.json({ error: t("shared.invalidForm") }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "An error occurred" }, { status: error.status || 500 });
  }
}
