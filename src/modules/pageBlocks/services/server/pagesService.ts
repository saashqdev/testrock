import { PageBlockDto } from "@/modules/pageBlocks/dtos/PageBlockDto";
import { getServerTranslations } from "@/i18n/server";
import { fallbackLng, languages } from "@/i18n/settings";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";
import { defaultSeoMetaTags } from "../../utils/defaultSeoMetaTags";
import { PageBlock, PageMetaTag } from "@prisma/client";
import { getUserInfo, UserSession } from "@/lib/services/session.server";
import { redirect } from "next/navigation";
import { defaultPricingPage } from "../../utils/defaultPages/defaultPricingPage";
import { defaultLandingPage } from "../../utils/defaultPages/defaultLandingPage";
import { PageConfiguration } from "../../dtos/PageConfiguration";
import { PageLoaderData } from "../../dtos/PageBlockData";
import { PageBlockService } from "./blocksService";
import { defaultBlogPage } from "../../utils/defaultPages/defaultBlogPage";
import { defaultBlogPostPage } from "../../utils/defaultPages/defaultBlogPostPage";
import { TFunction } from "i18next";
import { cachified } from "@/lib/services/cache.server";
import { defaultPages } from "../../utils/defaultPages";
import { getBaseURL } from "@/utils/url.server";
import { PageWithDetailsDto } from "@/db/models/pageBlocks/PagesModel";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { headers } from "next/headers";

// Helper function to get or construct a Request object
async function getOrConstructRequest(request?: Request): Promise<Request> {
  if (request) {
    return request;
  }
  
  // Construct request from headers
  const heads = await headers();
  const url = heads.get("x-url") || "/";
  const host = heads.get("host") || "localhost:3000";
  const protocol = heads.get("x-forwarded-proto") || "http";
  
  // Ensure url starts with / and doesn't already contain protocol/host
  const pathname = url.startsWith("http") ? new URL(url).pathname + new URL(url).search : url;
  const fullUrl = `${protocol}://${host}${pathname}`;
  
  return new Request(fullUrl);
}

export async function getPageConfiguration({
  request,
  t,
  slug,
  page,
  tenantId,
}: {
  request: Request;
  t?: TFunction;
  slug: string;
  page?: PageWithDetailsDto | null;
  tenantId?: string | null;
}): Promise<PageConfiguration> {
  if (!t) {
    t = (await getServerTranslations()).t;
  }
  if (!page) {
    page = await cachified({
      key: `page:${slug}`,
      ttl: 1000 * 60 * 60 * 24,
      disabled: true,
      getFreshValue: () => db.pages.getPageBySlug(slug),
    });
  }

  const linkTags: MetaTagsDto = await getLinkTags(request);

  return {
    page,
    name: !page ? slug : page?.slug === "/" ? "Landing" : page?.slug,
    slug: page?.slug ?? slug,
    blocks: parsePageBlocks({ t, slug, blocks: page?.blocks ?? [] }),
    metatags: [...(await getPageMetaTags({ t, slug: page?.slug ?? slug, metatags: page?.metaTags ?? [] })), ...linkTags],
  };
}

export async function getPageMetaTags({
  t,
  metatags,
  slug,
  loadDefault = true,
}: {
  t: TFunction;
  metatags: PageMetaTag[];
  slug?: string;
  loadDefault?: boolean;
}) {
  if (!metatags || metatags.length === 0) {
    metatags = await db.pageMetaTags.getMetaTags(null);
  }
  let tags: MetaTagsDto = [];
  if (loadDefault) {
    tags = defaultSeoMetaTags({ t, slug });
  }
  if (metatags.length > 0) {
    metatags.forEach((tag) => {
      tags.push({ name: tag.name, content: tag.value });
    });
  }
  return tags;
}

export function parsePageBlocks({ t, slug, blocks }: { t: TFunction; slug: string; blocks: PageBlock[] }): PageBlockDto[] {
  let parsedBlocks: PageBlockDto[] = blocks.map((block) => {
    return JSON.parse(block.value) as PageBlockDto;
  });

  if (parsedBlocks.length !== 0) {
    return parsedBlocks;
  }

  switch (slug) {
    case "/":
      return defaultLandingPage({ t });
    case "/pricing":
      return defaultPricingPage({ t });
    case "/blog":
      return defaultBlogPage({ t });
    case "/blog/:id1":
      return defaultBlogPostPage({ t });
    default:
      return [];
  }
}

export async function createDefaultPages() {
  const allPages = await db.pages.getPages();
  const existingPages = allPages.map((page) => page.slug);
  return await Promise.all(
    defaultPages
      .filter((page) => !existingPages.includes(page))
      .map(async (slug) => {
        return await db.pages.createPage({
          slug,
          isPublished: true,
          isPublic: true,
        });
      })
  );
}

export type PagePermissionResult = {
  unauthorized?: {
    redirect?: string;
    error?: string;
  };
};
export function verifyPageVisibility({ page, userSession }: { page: PageWithDetailsDto | null; userSession: UserSession }) {
  const result: PagePermissionResult | undefined = {};
  if (page && page.slug !== "/") {
    if (!page.isPublic && (!userSession.userId || userSession.userId.trim().length === 0)) {
      result.unauthorized = { redirect: "/login", error: "Unauthorized" };
    }
    if (!page.isPublished) {
      result.unauthorized = { redirect: "/404?page=" + page.slug, error: "Page not published" };
    }
  }
  return result;
}

export async function getCurrentPage({
  request,
  params,
  slug,
  tenantId,
}: {
  request?: Request;
  params: IServerComponentsProps;
  slug: string;
  tenantId?: string;
}): Promise<PageLoaderData> {
  const { t } = await getServerTranslations();
  const req = await getOrConstructRequest(request);
  const baseUrl = await getBaseURL();
  const url = new URL(req?.url || "/", baseUrl);
  const fullUrl = url.pathname + url.search;
  const page = await getPageConfiguration({ request: req, t, slug, tenantId });

  const userSession = await getUserInfo();
  const { unauthorized } = verifyPageVisibility({ page: page.page, userSession });
  if (unauthorized?.redirect) {
    throw redirect(unauthorized.redirect + "?redirect=" + fullUrl);
  }
  const pageResult: PageLoaderData = {
    ...page,
    userSession,
    authenticated: userSession.userId?.length > 0,
    t,
    blocks: page.blocks,
  };
  return await PageBlockService.load({ request: req, params, t, page: pageResult });
}

export async function getLinkTags(request?: Request) {
  const baseUrl = await getBaseURL();
  const urlObj = request?.url ? new URL(request.url) : new URL("/", baseUrl);
  const pathname = `${baseUrl}${urlObj.pathname}`;
  const searchParams = urlObj.searchParams;
  const lng = searchParams.get("lng") ?? fallbackLng;
  const linkTags: MetaTagsDto = [];

  // Set the canonical link
  const canonicalHref = lng === fallbackLng ? pathname : `${pathname}?lng=${lng}`;
  linkTags.push({ property: "og:locale", content: lng });
  linkTags.push({ tagName: "link", rel: "canonical", href: canonicalHref });
  linkTags.push({ property: "og:url", content: canonicalHref });

  // Add hreflang tags for each supported language
  languages.forEach((supportedLng) => {
    const href = supportedLng === fallbackLng ? pathname : `${pathname}?lng=${supportedLng}`;
    linkTags.push({ tagName: "link", rel: "alternate", href: href, hrefLang: supportedLng });
  });
  linkTags.push({ tagName: "link", rel: "alternate", href: pathname, hrefLang: "x-default" });

  return linkTags;
}
