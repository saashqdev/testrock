export type BlogTagsModel = {
  id: string;
  createdAt: Date;
  updatedAt: Date;
  tenantId: string;
  name: string;
  slug: string;
  description: string | null;
  active: boolean;
};
