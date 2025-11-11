import { redirect } from "next/navigation";
import { getServerTranslations } from "@/i18n/server";
import FormulaForm from "@/modules/formulas/components/FormulaForm";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { revalidatePath } from "next/cache";
import { db } from "@/db";

export default async function NewFormulaPage() {
  // Server Action for creating formula
  async function createNewFormula(formData: FormData) {
    "use server";
    
    await verifyUserHasPermission(null as any, "admin.formulas.create");
    const { t } = await getServerTranslations();

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
      await db.formulas.createFormula({
        name,
        description,
        resultAs,
        calculationTrigger,
        components,
        withLogs,
      });

      revalidatePath("/admin/entities/formulas");
      redirect("/admin/entities/formulas");
    } catch (e: any) {
      // eslint-disable-next-line no-console
      console.error(e.message);
      throw e;
    }
  }

  return (
    <div>
      <FormulaForm item={undefined} updateFormula={createNewFormula} />
    </div>
  );
}
