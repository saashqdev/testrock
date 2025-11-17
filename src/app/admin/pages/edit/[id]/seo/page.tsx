import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { loader as pageMetaTagsLoader, action as pageMetaTagsAction } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => pageMetaTagsLoader(props);
export const action = (props: IServerComponentsProps) => pageMetaTagsAction(props);

export default async function SeoPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <PageMetaTagsRouteIndex data={data} />;
}
