import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { PageMetaTags_Index } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => PageMetaTags_Index.loader(props);
export const action = (props: IServerComponentsProps) => PageMetaTags_Index.action(props);

export default async function SeoPage(props: IServerComponentsProps) {
  const data = await PageMetaTags_Index.loader(props);
  return <PageMetaTagsRouteIndex data={data} />;
}
