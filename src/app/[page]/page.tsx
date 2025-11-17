import { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentPage } from "@/modules/pageBlocks/services/server/pagesService";
import { action } from "@/modules/pageBlocks/services/server/blocksService";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import RedirectsService from "@/modules/redirects/RedirectsService";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const request = props.request!;
  const page = await getCurrentPage({ 
    request, 
    params, 
    slug: "/" + (params.page || "") 
  });
  
  // Convert MetaTagsDto array to Metadata object
  const metadata: Metadata = {};
  if (page.metatags) {
    for (const tag of page.metatags) {
      if ('title' in tag && tag.title) {
        metadata.title = tag.title;
      }
      if ('description' in tag && tag.description) {
        metadata.description = tag.description;
      }
      // Add more conversions as needed
    }
  }
  return metadata;
}

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request;
  
  await RedirectsService.findAndRedirect({ request });
  
  const page = await getCurrentPage({ 
    request, 
    params, 
    slug: "/" + (params.page || "") 
  });
  
  if (!page.page && page.blocks.length === 0 && !params.page?.includes(".")) {
    throw notFound();
  }
  return page;
};

export const action = async (props: IServerComponentsProps) => {
  return action(props);
};

export default async function Page(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request;
  
  await RedirectsService.findAndRedirect({ request });
  
  const data = await getCurrentPage({ 
    request, 
    params, 
    slug: "/" + (params.page || "") 
  });
  
  const { t } = await getServerTranslations();
  
  if (!data.page && data.blocks.length === 0 && !params.page?.includes(".")) {
    notFound();
  }

  return (
    <>
      {data.error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <ErrorBanner title={t("shared.error")} text={data.error} />
        </div>
      ) : (
        <PageBlocks items={data.blocks} />
      )}
    </>
  );
}
