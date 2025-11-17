import { Metadata } from "next";
import RowOverviewRoute from "@/modules/rows/components/RowOverviewRoute";
import ServerError from "@/components/ui/errors/ServerError";
import { LoaderData, loader, action } from "@/modules/rows/routes/Rows_Overview.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await loader(props);
  const loaderData = await data.json() as LoaderData;
  
  // Convert NextJS-style meta array to Next.js Metadata
  const metadata: Metadata = {};
  if (loaderData?.meta) {
    for (const meta of loaderData.meta) {
      if ('title' in meta) {
        metadata.title = meta.title;
      }
      if ('name' in meta && 'content' in meta) {
        if (meta.name === 'description') {
          metadata.description = meta.content;
        }
      }
    }
  }
  
  return metadata;
}
export const loader = (props: IServerComponentsProps) => loader(props);
export const action = (props: IServerComponentsProps) => action(props);

export default async function (props: IServerComponentsProps) {
  const response = await loader(props);
  const data = await response.json() as LoaderData;
  
  return (
    <RowOverviewRoute
      rowData={data.rowData}
      item={data.rowData.item}
      routes={data.routes}
      relationshipRows={data.relationshipRows}
    />
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
