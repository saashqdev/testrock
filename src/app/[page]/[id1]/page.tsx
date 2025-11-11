import { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentPage } from "@/modules/pageBlocks/services/server/pagesService";
import { PageBlockService } from "@/modules/pageBlocks/services/server/blocksService";
import PageBlocks from "@/modules/pageBlocks/components/blocks/PageBlocks";
import ServerError from "@/components/ui/errors/ServerError";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const params = (await props.params) || {};
  const request = props.request!;
  const page = await getCurrentPage({ request, params, slug: "/" + params.page + "/:id1" });
  
  // Convert MetaTagsDto array to Metadata object
  const metadata: Metadata = {};
  if (page.metatags) {
    for (const tag of page.metatags) {
      if ('title' in tag) {
        metadata.title = tag.title;
      }
      // Add more conversions as needed
    }
  }
  return metadata;
}

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;
  const page = await getCurrentPage({ request, params, slug: "/" + params.page + "/:id1" });
  if (!page.page && page.blocks.length === 0) {
    throw redirect("/404?page=" + params.page);
  }
  return page;
};

export const action = async (props: IServerComponentsProps) => {
  return PageBlockService.action({ request: props.request!, params: props.params });
};

export default async function Page(props: IServerComponentsProps) {
  const params = (await props.params) || {};
  const request = props.request!;
  
  const data = await getCurrentPage({ request, params, slug: "/" + params.page + "/:id1" });
  const { t } = await getServerTranslations();
  
  if (!data.page && data.blocks.length === 0) {
    redirect("/404?page=" + params.page);
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

export function ErrorBoundary() {
  return <ServerError />;
}
