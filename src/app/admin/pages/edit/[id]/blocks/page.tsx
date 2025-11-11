import PageBlocksRouteIndex from "@/modules/pageBlocks/components/pages/PageBlocksRouteIndex";
import { PageBlocks_Index } from "@/modules/pageBlocks/routes/pages/PageBlocks_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => PageBlocks_Index.loader(props);
export const action = (props: IServerComponentsProps) => PageBlocks_Index.action(props);

export default async function BlocksPage(props: IServerComponentsProps) {
  const data = await PageBlocks_Index.loader(props);
  return <PageBlocksRouteIndex data={data} />;
}
