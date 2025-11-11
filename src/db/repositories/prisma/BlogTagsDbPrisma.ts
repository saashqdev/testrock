import { IBlogTagsDb } from "@/db/interfaces/blog/IBlogTagsDb";
import { BlogPost, BlogTag } from "@prisma/client";
import { prisma } from "@/db/config/prisma/database";
import { Colors } from "@/lib/enums/shared/Colors";
export class BlogTagsDbPrisma implements IBlogTagsDb {
  async getAllBlogTags(tenantId: string | null): Promise<BlogTag[]> {
    return await prisma.blogTag.findMany({
      where: { tenantId },
      orderBy: {
        color: "asc",
      },
    });
  }

  async syncBlogTags({ post, tagNames }: { post: BlogPost; tagNames: string[] }) {
    const tagsWithoutDuplicates = Array.from(new Set(tagNames));
    const tags = await Promise.all(
      tagsWithoutDuplicates.map(async (tagName) => {
        const tag = await prisma.blogTag.findUnique({
          where: {
            tenantId: post.tenantId,
            name: tagName.trim(),
          },
        });
        if (tag) {
          return tag;
        } else {
          return await prisma.blogTag.create({
            data: {
              tenantId: post.tenantId,
              name: tagName.trim(),
              color: Colors.BLUE,
            },
          });
        }
      })
    );
    await prisma.blogPostTag.deleteMany({
      where: {
        postId: post.id,
      },
    });
    await Promise.all(
      tags.map(async (tag) => {
        return await prisma.blogPostTag.create({
          data: {
            postId: post.id,
            tagId: tag.id,
          },
        });
      })
    );
  }
}
