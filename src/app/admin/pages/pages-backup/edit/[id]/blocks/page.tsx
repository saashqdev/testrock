import PageBlocksRouteIndex from "@/modules/pageBlocks/components/pages/PageBlocksRouteIndex";
import { loader } from "@/modules/pageBlocks/routes/pages/PageBlocks_Index";

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
  const data = await loader(mockProps);
  return <PageBlocksRouteIndex data={data} />;
}
