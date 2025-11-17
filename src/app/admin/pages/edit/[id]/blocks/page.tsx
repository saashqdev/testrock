import PageBlocksRouteIndex from "@/modules/pageBlocks/components/pages/PageBlocksRouteIndex";
import { loader as pageBlocksLoader } from "@/modules/pageBlocks/routes/pages/PageBlocks_Index";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function BlocksPage(props: IServerComponentsProps) {
  const data = await pageBlocksLoader(props);
  return <PageBlocksRouteIndex data={data} />;
}
