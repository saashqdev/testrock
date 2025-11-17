import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { loader, action } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => loader(props);
export const action = (props: IServerComponentsProps) => action(props);

export default async function SeoPage(props: IServerComponentsProps) {
  const data = await loader(props);
  
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <PageMetaTagsRouteIndex data={data} />
    </div>
  );
}
