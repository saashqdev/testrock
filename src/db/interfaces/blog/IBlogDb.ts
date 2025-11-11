import { BlogPostWithDetailsDto } from "@/db/models/blog/BlogModel";

export interface IBlogDb {
  getAllBlogPosts({ tenantId, published }: { tenantId: string | null; published?: boolean | undefined }): Promise<BlogPostWithDetailsDto[]>;
  getBlogPost({ tenantId, idOrSlug }: { tenantId: string | null; idOrSlug: string }): Promise<BlogPostWithDetailsDto | null>;
  deleteBlogPost(id: string): Promise<{
    tenantId: string | null;
    published: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    slug: string;
    title: string;
    description: string;
    date: Date;
    image: string;
    content: string;
    readingTime: string;
    authorId: string | null;
    categoryId: string | null;
    contentType: string;
  }>;
  createBlogPost(data: {
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
  }): Promise<{
    tenantId: string | null;
    published: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    slug: string;
    title: string;
    description: string;
    date: Date;
    image: string;
    content: string;
    readingTime: string;
    authorId: string | null;
    categoryId: string | null;
    contentType: string;
  }>;
  updateBlogPost(
    id: string,
    data: {
      slug?: string | undefined;
      title?: string | undefined;
      description?: string | undefined;
      date?: Date | undefined;
      image?: string | undefined;
      content?: string | undefined;
      readingTime?: string | undefined;
      published?: boolean | undefined;
      authorId?: string | null | undefined;
      categoryId?: string | null | undefined;
      tagNames?: string[] | undefined;
      contentType?: string | undefined;
    }
  ): Promise<{
    tenantId: string | null;
    published: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    slug: string;
    title: string;
    description: string;
    contentType: string;
  }>;
  updateBlogPostImage(
    id: string,
    data: {
      image: string;
    }
  ): Promise<{
    tenantId: string | null;
    published: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    slug: string;
    title: string;
    description: string;
    date: Date;
    image: string;
    content: string;
    readingTime: string;
    authorId: string | null;
    categoryId: string | null;
    contentType: string;
  }>;
  updateBlogPostPublished(
    id: string,
    published: boolean
  ): Promise<{
    tenantId: string | null;
    published: boolean;
    id: string;
    createdAt: Date;
    updatedAt: Date | null;
    slug: string;
    title: string;
    description: string;
    date: Date;
    image: string;
    content: string;
    readingTime: string;
    authorId: string | null;
    categoryId: string | null;
    contentType: string;
  }>;
}
