import { PageBlockActionArgs } from "@/modules/pageBlocks/dtos/PageBlockActionArgs";
import { PageBlockLoaderArgs } from "@/modules/pageBlocks/dtos/PageBlockLoaderArgs";
import { getUserInfo } from "@/lib/services/session.server";
import { BlockVariableService } from "../../../shared/variables/BlockVariableService.server";
import { BlogPostBlockData } from "./BlogPostBlockUtils";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { getLinkTags } from "@/modules/pageBlocks/services/server/pagesService";
import { db } from "@/db";

export namespace BlogPostBlockService {
  export async function load({ request, params, block }: PageBlockLoaderArgs): Promise<BlogPostBlockData> {
    const postSlug = BlockVariableService.getValue({
      request,
      params,
      variable: block?.blogPost?.variables?.postSlug || {
        type: "param",
        param: "slug",
      },
    });
    if (!postSlug) {
      throw new Error("Slug variable not set");
    }
    const userInfo = await getUserInfo();
    const user = await db.users.getUser(userInfo.userId);
    const post = await db.blog.getBlogPost({ tenantId: null, idOrSlug: postSlug });
    if (!post) {
      throw Response.json({ error: "Post not found with slug: " + postSlug }, { status: 404 });
    }
    if (!post.published && (!user || !user.admin)) {
      throw Response.json({ error: "Post not published" }, { status: 404 });
    }
    const linkTags = await getLinkTags(request);
    let metaTags: MetaTagsDto = [
      { title: post.title },
      { name: "description", content: post.description },
      { name: "keywords", content: post.tags.map((postTag) => postTag.tag.name).join(",") },
      { property: "og:image", content: post.image },
      { property: "og:type", content: "article" },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      // { property: "og:url", content: `${getBaseURL(request)}/blog/${post.slug}` },
      { property: "twitter:image", content: post.image },
      { property: "twitter:card", content: "summary_large_image" },
      { property: "twitter:title", content: post.title },
      { property: "twitter:description", content: post.description },
      ...linkTags,
    ];
    if (block?.blogPost?.socials?.twitter) {
      metaTags = [...metaTags, { property: "twitter:site", content: block.blogPost.socials.twitter }];
    }
    if (block?.blogPost?.socials?.twitterCreator) {
      metaTags = [...metaTags, { property: "twitter:creator", content: block.blogPost.socials.twitterCreator }];
    }
    return {
      post,
      canEdit: user?.admin !== undefined,
      metaTags,
    };
  }
  export async function publish({ params, form }: PageBlockActionArgs) {
    const postId = form.get("id")?.toString() ?? "";
    const post = await db.blog.getBlogPost({ tenantId: null, idOrSlug: postId });
    if (!post) {
      throw Response.json({ error: "Post not found with id: " + postId }, { status: 404 });
    }
    await db.blog.updateBlogPostPublished(post.id ?? "", true);
    return Response.json({});
  }
}
