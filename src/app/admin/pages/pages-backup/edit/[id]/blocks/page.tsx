import PageBlocksRouteIndex from "@/modules/pageBlocks/components/pages/PageBlocksRouteIndex";
import { PageBlocks_Index } from "@/modules/pageBlocks/routes/pages/PageBlocks_Index";

export default async function BlocksPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mockProps = { 
    params: Promise.resolve({ id }), 
    request: new Request("http://localhost") 
  };
  const data = await PageBlocks_Index.loader(mockProps);
  return <PageBlocksRouteIndex data={data} />;
}
