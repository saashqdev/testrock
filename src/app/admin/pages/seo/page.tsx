import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { loader as pageMetaTagsLoader } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function SeoPage(props: IServerComponentsProps) {
  const data = await pageMetaTagsLoader(props);
  
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <PageMetaTagsRouteIndex data={data} />
    </div>
  );
}
