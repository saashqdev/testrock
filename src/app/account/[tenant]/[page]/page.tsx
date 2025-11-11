import { redirect } from "next/navigation";
import { Metadata } from "next";
import { getCurrentPage } from "@/modules/pageBlocks/services/server/pagesService";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import ServerError from "@/components/ui/errors/ServerError";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { getTenantIdFromUrl } from "@/utils/services/server/urlService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getMetaTags } from "@/modules/pageBlocks/seo/SeoMetaTagsUtils";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdFromUrl(params);
  const page = await getCurrentPage({ request, params, slug: "/" + params.page, tenantId });
  
  // Convert array-based metatags to Next.js Metadata format
  if (page?.page?.metaTags && page.page.metaTags.length > 0) {
    const firstTitleTag = page.page.metaTags.find(tag => tag.name === 'title');
    const firstDescTag = page.page.metaTags.find(tag => tag.name === 'description');
    
    return getMetaTags({
      title: firstTitleTag?.value,
      description: firstDescTag?.value,
    });
  }
  
  return getMetaTags();
}

export default async function TenantPage(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  const tenantId = await getTenantIdFromUrl(params);
  const data = await getCurrentPage({ request, params, slug: "/" + params.page, tenantId });
  
  if (!data.page && data.blocks.length === 0) {
    redirect("/404?page=" + params.page);
  }

  return (
    <>
      {data.error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <ErrorBanner title="Error" text={data.error} />
        </div>
      ) : (
        <PageBlocks items={data.blocks} />
      )}
    </>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
