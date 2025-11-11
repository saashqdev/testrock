import { IBlogCategoriesDb } from "@/db/interfaces/blog/IBlogCategoriesDb";
import { prisma } from "@/db/config/prisma/database";
import { BlogCategoriesDto } from "@/db/models/blog/BlogCategoriesModel";

export class BlogCategoriesDbPrisma implements IBlogCategoriesDb {
  async getAllBlogCategories(tenantId: string | null): Promise<BlogCategoriesDto[]> {
    return await prisma.blogCategory.findMany({
      where: { tenantId },
      orderBy: {
        color: "asc",
      },
    });
  }

  async getBlogCategoryById(id: string): Promise<BlogCategoriesDto | null> {
    return await prisma.blogCategory.findUnique({
      where: {
        id,
      },
    });
  }

  async getBlogCategoryByName({ tenantId, name }: { tenantId: string | null; name: string }): Promise<BlogCategoriesDto | null> {
    return await prisma.blogCategory
      .findFirstOrThrow({
        where: {
          tenantId,
          name,
        },
      })
      .catch(() => null);
  }

  async createBlogCategory(data: { tenantId: string | null; name: string; color: number }) {
    return await prisma.blogCategory.create({
      data: {
        tenantId: data.tenantId,
        name: data.name,
        color: data.color,
      },
    });
  }
}
