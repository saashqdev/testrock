import { Colors } from "@/lib/enums/shared/Colors";
import { db } from "@/db";

export namespace BlogApi {
  export async function getCategory({ tenantId, idOrName }: { tenantId: string | null; idOrName: { id: string } | { name: string } }) {
    if ("id" in idOrName) {
      return await db.blogCategories.getBlogCategoryById(idOrName.id);
    } else {
      const categories = await db.blogCategories.getAllBlogCategories(tenantId);
      const found = categories.find((category) => category.name.toLowerCase().trim() === idOrName.name.toLowerCase().trim());
      return found ?? null;
    }
  }
  export async function createCategory(data: { tenantId: string | null; name: string; color?: number }) {
    return await db.blogCategories.createBlogCategory({
      tenantId: data.tenantId,
      name: data.name,
      color: data.color ?? Colors.UNDEFINED,
    });
  }
}
