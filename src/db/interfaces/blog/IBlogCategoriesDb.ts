import { BlogCategoriesDto } from "@/db/models/blog/BlogCategoriesModel";
export interface IBlogCategoriesDb {
  getAllBlogCategories(tenantId: string | null): Promise<BlogCategoriesDto[]>;
  getBlogCategoryById(id: string): Promise<BlogCategoriesDto | null>;
  getBlogCategoryByName(data: { tenantId: string | null; name: string }): Promise<BlogCategoriesDto | null>;
  createBlogCategory(data: { tenantId: string | null; name: string; color: number }): Promise<BlogCategoriesDto>;
}
