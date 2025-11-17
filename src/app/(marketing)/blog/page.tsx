import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { getServerTranslations } from "@/i18n/server";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import BlogPostsVariantSimple from "@/modules/pageBlocks/components/blocks/marketing/blog/posts/BlogPostsVariantSimple";
import { load } from "@/modules/pageBlocks/components/blocks/marketing/blog/posts/BlogPostsBlockService.server";
import { Metadata } from "next";
import { headers } from "next/headers";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getServerTranslations();
  return {
    title: `${t("blog.title")} | ${process.env.APP_NAME}`,
    description: t("blog.headline"),
  };
}

export default async function BlogPage() {
  const { t } = await getServerTranslations();
  const headersList = await headers();
  
  // Create a request object from headers for service compatibility
  const host = headersList.get("host") || "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const request = new Request(`${protocol}://${host}/blog`);
  
  const blogData = await load({ request, params: {}, t });

  return (
    <div>
      <HeaderBlock />
      <div className="py-4">
        <HeadingBlock
          item={{
            style: "centered",
            headline: t("blog.title"),
            subheadline: t("blog.headline"),
          }}
        />
      </div>

      <BlogPostsVariantSimple
        item={{
          style: "simple",
          withCoverImage: true,
          withAuthorName: true,
          withAuthorAvatar: true,
          withDate: true,
          blogPath: "/blog",
          data: blogData,
        }}
      />

      <FooterBlock />
    </div>
  );
}
