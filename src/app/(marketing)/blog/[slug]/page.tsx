import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { getServerTranslations } from "@/i18n/server";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import BlogPostVariantSimple from "@/modules/pageBlocks/components/blocks/marketing/blog/post/BlogPostVariantSimple";
import { load } from "@/modules/pageBlocks/components/blocks/marketing/blog/post/BlogPostBlockService.server";
import { defaultSocials } from "@/modules/pageBlocks/pages/defaultSocials";
import { Metadata } from "next";
import { headers } from "next/headers";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();
  const headersList = await headers();
  
  const host = headersList.get("host") || "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const request = new Request(`${protocol}://${host}/blog/${resolvedParams.slug}`);
  
  try {
    const blogPostData = await load({ 
      request, 
      params: resolvedParams, 
      t 
    });
    
    return {
      title: `${blogPostData.post.title} | ${t("blog.title")} | ${process.env.APP_NAME}`,
      description: blogPostData.post.description,
    };
  } catch (error) {
    return {
      title: `${t("blog.title")} | ${process.env.APP_NAME}`,
    };
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { t } = await getServerTranslations();
  const headersList = await headers();
  
  const host = headersList.get("host") || "localhost";
  const protocol = host.includes("localhost") ? "http" : "https";
  const request = new Request(`${protocol}://${host}/blog/${resolvedParams.slug}`);
  
  const blogPostData = await load({ 
    request, 
    params: resolvedParams, 
    t 
  });

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

      <BlogPostVariantSimple
        item={{
          style: "simple",
          socials: defaultSocials,
          data: blogPostData,
        }}
      />

      <FooterBlock />
    </div>
  );
}
