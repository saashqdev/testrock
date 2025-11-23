import { Metadata } from "next";
import ServerError from "@/components/ui/errors/ServerError";
import { getServerTranslations } from "@/i18n/server";
import BlogPostBlock from "@/modules/pageBlocks/components/blocks/marketing/blog/post/BlogPostBlock";
import FooterBlock from "@/modules/pageBlocks/components/blocks/marketing/footer/FooterBlock";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { getBaseURL } from "@/utils/url.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import ClientBlogPost from "./ClientBlogPost";
import { db } from "@/db";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  const post = await db.blog.getBlogPost({ tenantId, idOrSlug: params.postSlug! });

  if (!post) {
    return {
      title: t("shared.notFound"),
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags.map((postTag) => postTag.tag.name).join(","),
    openGraph: {
      title: post.title,
      description: post.description,
      images: [post.image],
      url: !tenantId ? `${getBaseURL()}/blog/${post.slug}` : `${getBaseURL()}/b/${params.tenant}/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [post.image],
    },
    alternates: {
      canonical: `${getBaseURL()}/blog/${post.slug}`,
    },
  };
}

async function getData(params: { tenant?: string; postSlug?: string }) {
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdFromUrl(params);
  const userInfo = await getUserInfo();
  const user = await db.users.getUser(userInfo.userId);
  const post = await db.blog.getBlogPost({ tenantId, idOrSlug: params.postSlug! });

  if (!post) {
    return { post: null, canEdit: false };
  }

  if (!post.published && (!user || !user.admin)) {
    return { post: null, canEdit: false };
  }

  return {
    post,
    canEdit: user?.admin !== undefined,
  };
}

export default async function BlogPostPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const data = await getData(params);

  return (
    <div>
      <HeaderBlock />
      {!data.post ? (
        <ClientBlogPost post={null} canEdit={false} tenant={params.tenant} />
      ) : (
        <>
          <BlogPostBlock
            item={{
              style: "simple",
              data: {
                post: data.post,
                canEdit: data.canEdit,
              },
            }}
          />
        </>
      )}
      <FooterBlock />
    </div>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
