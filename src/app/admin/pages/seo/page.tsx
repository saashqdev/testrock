import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { PageMetaTags_Index } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => PageMetaTags_Index.loader(props);
export const action = (props: IServerComponentsProps) => PageMetaTags_Index.action(props);

export default async function SeoPage(props: IServerComponentsProps) {
  const data = await PageMetaTags_Index.loader(props);
  
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <PageMetaTagsRouteIndex data={data} />
    </div>
  );
}
