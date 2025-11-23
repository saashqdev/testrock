import PageMetaTagsRouteIndex from "@/modules/pageBlocks/components/pages/PageMetaTagsRouteIndex";
import { loader } from "@/modules/pageBlocks/routes/pages/PageMetaTags_Index";

async function getData() {
  const mockProps = { params: Promise.resolve({}), request: new Request("http://localhost") };
  return await loader(mockProps);
}

export default async function SeoPage() {
  const data = await getData();

  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <PageMetaTagsRouteIndex data={data} />
    </div>
  );
}
