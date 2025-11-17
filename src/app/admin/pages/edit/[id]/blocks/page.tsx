import PageBlocksRouteIndex from "@/modules/pageBlocks/components/pages/PageBlocksRouteIndex";
import { loader, action } from "@/modules/pageBlocks/routes/pages/PageBlocks_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export const loader = (props: IServerComponentsProps) => loader(props);
export const action = (props: IServerComponentsProps) => action(props);

export default async function BlocksPage(props: IServerComponentsProps) {
  const data = await loader(props);
  return <PageBlocksRouteIndex data={data} />;
}
