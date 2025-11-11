import { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostDto } from "@/modules/blog/dtos/BlogPostDto";
import BlogPostsBlock from "@/modules/pageBlocks/components/blocks/marketing/blog/posts/BlogPostsBlock";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import HeadingBlock from "@/modules/pageBlocks/components/blocks/marketing/heading/HeadingBlock";
import { TenantDto } from "@/db/models/accounts/TenantsModel";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";

import { db } from "@/db";

export async function generateMetadata({ params }: IServerComponentsProps): Promise<Metadata> {
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams || {});
  const tenant = await db.tenants.getTenantDto(tenantId);
  
  return {
    title: `${tenant?.name || 'Blog'} | Blog | ${process.env.APP_NAME}`,
  };
}
type PageData = {
  tenant: TenantDto | null;
  items: BlogPostDto[];
};

export default async function BlogPage({ params }: IServerComponentsProps) {
  const resolvedParams = await params;
  const tenantId = await getTenantIdFromUrl(resolvedParams || {});
  const tenant = await db.tenants.getTenantDto(tenantId);
  
  if (!tenant) {
    notFound();
  }

  const data: PageData = {
    tenant: tenantId ? await db.tenants.getTenantDto(tenantId) : null,
    items: await db.blog.getAllBlogPosts({ tenantId, published: true }),
  };

  const { t } = await getServerTranslations();

  return <BlogPageContent data={data} t={t} />;
}

function BlogPageContent({ data, t }: { data: PageData; t: any }) {
  return (
    <div>
      <HeaderBlock />
      <div className="py-4">
        <HeadingBlock
          item={{
            style: "centered",
            headline: !data.tenant ? t("blog.title") : `${data.tenant?.name} ${t("blog.title")}`,
            subheadline: !data.tenant ? t("blog.headline") : "",
          }}
        />
      </div>
      <BlogPostsBlock
        item={{
          style: "simple",
          withCoverImage: true,
          withAuthorName: true,
          withAuthorAvatar: true,
          withDate: true,
          blogPath: data.tenant ? `/b/${data.tenant.slug}` : "/blog",
          data: data.items,
        }}
      />
      <FooterBlock />
    </div>
  );
}
