import { BlogPost, BlogCategory, BlogPostTag, BlogTag } from "@prisma/client";
import { UserDto } from "@/db/models/accounts/UsersModel";

export type BlogPostWithDetailsDto = BlogPost & {
  author: (UserDto & { avatar: string | null }) | null;
  category: BlogCategory | null;
  tags: (BlogPostTag & { tag: BlogTag })[];
};
