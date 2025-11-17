import { PageBlockLoaderArgs } from "@/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { cachified } from "@/lib/services/cache.server";
import { db } from "@/db";

export async function load(_: PageBlockLoaderArgs) {
  return await cachified({
    key: `blog:published`,
    ttl: 1000 * 60 * 60 * 24,
    disabled: true, // live data at all times
    getFreshValue: () => db.blog.getAllBlogPosts({ tenantId: null, published: true }),
  });
}

