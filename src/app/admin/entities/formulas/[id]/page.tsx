import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import FormulaForm from "@/modules/formulas/components/FormulaForm";
import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";
import FormulaHelpers from "@/modules/formulas/utils/FormulaHelpers";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { db } from "@/db";
import { revalidatePath } from "next/cache";

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getFormulaData(id: string): Promise<FormulaDto> {
  const item = await db.formulas.getFormula(id);
  if (!item) {
    redirect("/admin/entities/formulas");
  }
  return FormulaHelpers.getFormulaDto(item);
}

export default async function FormulaEditPage({ params }: PageProps) {
  const { id } = await params;

  // Load data server-side
  const item = await getFormulaData(id);

  // Server Actions for mutations
  async function updateFormula(formData: FormData) {
    "use server";

    await verifyUserHasPermission(null as any, "admin.formulas.update");
    const { t } = await getServerTranslations();

    const item = await db.formulas.getFormula(id);
    if (!item) {
      redirect("/admin/entities/formulas");
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
      throw new Error("Missing required fields.");
    }
    if (components.length === 0) {
      throw new Error("Missing formula components.");
    }

    try {
      await db.formulas.updateFormula(item.id, {
        name,
        description,
        resultAs,
        calculationTrigger,
        withLogs,
        components,
      });

      revalidatePath("/admin/entities/formulas");
      redirect("/admin/entities/formulas");
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      throw e;
    }
  }

  async function deleteFormula() {
    "use server";

    await verifyUserHasPermission(null as any, "admin.formulas.delete");
    await db.formulas.deleteFormula(id);

    revalidatePath("/admin/entities/formulas");
    redirect("/admin/entities/formulas");
  }

  return (
    <div>
      <FormulaForm item={item} onDelete={deleteFormula} updateFormula={updateFormula} />
    </div>
  );
}
