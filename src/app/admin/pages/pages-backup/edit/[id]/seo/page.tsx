import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { loader } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";

export default async function SeoPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const mockProps = {
    params: Promise.resolve({ id }),
    request: new Request("http://localhost"),
  };
  const data = await loader(mockProps);
  return <PageMetaTagsRouteIndex data={data} />;
}
