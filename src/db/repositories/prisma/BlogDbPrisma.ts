import { IBlogDb } from "@/db/interfaces/blog/IBlogDb";
import { BlogPost, BlogTag, Prisma } from "@prisma/client";
import { BlogPostWithDetailsDto } from "@/db/models/blog/BlogModel";
import { prisma } from "@/db/config/prisma/database";
import UserModelHelper from "@/lib/helpers/models/UserModelHelper";
import { clearCacheKey } from "@/lib/services/cache.server";
import { Colors } from "@/lib/enums/shared/Colors";
import { db } from "@/db";

export class BlogDbPrisma implements IBlogDb {
  async getAllBlogPosts({ tenantId, published }: { tenantId: string | null; published?: boolean }): Promise<BlogPostWithDetailsDto[]> {
    let where: Prisma.BlogPostWhereInput = {
      tenantId,
    };
    if (published) {
      where = {
        ...where,
        published,
      };
    }
    return await prisma.blogPost.findMany({
      where,
      orderBy: {
        date: "desc",
      },
      include: {
        author: { select: { ...UserModelHelper.selectSimpleUserProperties, avatar: true, admin: true, defaultTenantId: true } },
        category: true,
        tags: {
          include: {
            tag: true,
          },
        },
      },
    });
  }

  async getBlogPost({ tenantId, idOrSlug }: { tenantId: string | null; idOrSlug: string }): Promise<BlogPostWithDetailsDto | null> {
    return await prisma.blogPost
      .findFirstOrThrow({
        where: {
          tenantId,
          OR: [
            {
              id: idOrSlug,
            },
            {
              slug: idOrSlug,
            },
          ],
        },
        include: {
          author: { select: { ...UserModelHelper.selectSimpleUserProperties, avatar: true, admin: true, defaultTenantId: true } },
          category: true,
          tags: {
            include: {
              tag: true,
            },
          },
        },
      })
      .catch(() => {
        return null;
      });
  }

  async deleteBlogPost(id: string) {
    return await prisma.blogPost
      .delete({
        where: {
          id,
        },
      })
      .then((item) => {
        clearCacheKey(`blog:published`);
        return item;
      });
  }

  async createBlogPost(data: {
    tenantId: string | null;
    slug: string;
    title: string;
    description: string;
    date: Date;
    image: string;
    content: string;
    readingTime: string;
    published: boolean;
    authorId: string | null;
    categoryId: string | null;
    tagNames: string[];
    contentType: string;
  }): Promise<BlogPost> {
    const tags: BlogTag[] = [];

    await Promise.all(
      data.tagNames.map(async (tagName) => {
        const tag = await prisma.blogTag.findUnique({
          where: {
            tenantId: data.tenantId,
            name: tagName.trim(),
          },
        });
        if (tag) {
          tags.push(tag);
        } else {
          const tag = await prisma.blogTag.create({
            data: {
              tenantId: data.tenantId,
              name: tagName.trim(),
              color: Colors.BLUE,
            },
          });
          tags.push(tag);
        }
      })
    );

    const tagIds = tags.map((tag) => {
      return {
        tagId: tag.id,
      };
    });

    const post = await prisma.blogPost
      .create({
        data: {
          tenantId: data.tenantId,
          slug: data.slug,
          title: data.title,
          description: data.description,
          date: data.date,
          image: data.image,
          content: data.content,
          readingTime: data.readingTime,
          published: data.published,
          authorId: data.authorId,
          categoryId: data.categoryId,
          tags: {
            create: tagIds,
          },
          contentType: data.contentType,
        },
      })
      .then((item) => {
        clearCacheKey(`blog:published`);
        return item;
      });

    await db.blogTags.syncBlogTags({ post, tagNames: data.tagNames });

    return post;
  }

  async updateBlogPost(
    id: string,
    data: {
      slug?: string;
      title?: string;
      description?: string;
      date?: Date;
      image?: string;
      content?: string;
      readingTime?: string;
      published?: boolean;
      authorId?: string | null;
      categoryId?: string | null;
      tagNames?: string[];
      contentType?: string;
    }
  ): Promise<BlogPost> {
    const post = await prisma.blogPost
      .update({
        where: {
          id,
        },
        data: {
          slug: data.slug,
          title: data.title,
          description: data.description,
          date: data.date,
          image: data.image,
          content: data.content,
          readingTime: data.readingTime,
          published: data.published,
          authorId: data.authorId,
          categoryId: data.categoryId,
          contentType: data.contentType,
        },
      })
      .then((item) => {
        clearCacheKey(`blog:published`);
        return item;
      });

    if (data.tagNames) {
      await db.blogTags.syncBlogTags({ post, tagNames: data.tagNames });
    }

    return post;
  }

  async updateBlogPostImage(id: string, data: { image: string }): Promise<BlogPost> {
    return await prisma.blogPost.update({
      where: { id },
      data: {
        image: data.image,
      },
    });
  }

  async updateBlogPostPublished(id: string, published: boolean): Promise<BlogPost> {
    return await prisma.blogPost
      .update({
        where: {
          id,
        },
        data: {
          published,
        },
      })
      .then((item) => {
        clearCacheKey(`blog:published`);
        return item;
      });
  }
}
