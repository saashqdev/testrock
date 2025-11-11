import { BlogPost, BlogTag } from "@prisma/client";
export interface IBlogTagsDb {
  getAllBlogTags(tenantId: string | null): Promise<BlogTag[]>;
  syncBlogTags({ post, tagNames }: { post: BlogPost; tagNames: string[] }): Promise<void>;
}
