import { BlogCategory } from "@prisma/client";

export type BlogCategoriesModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  active: boolean;
};

export type BlogCategoriesDto = BlogCategory;

export type BlogCategoriesWithTenantDto = BlogCategory & {
  tenant: {
    id: string;
    name: string;
    slug: string;
    icon: string | null;
    active: boolean;
  };
};
