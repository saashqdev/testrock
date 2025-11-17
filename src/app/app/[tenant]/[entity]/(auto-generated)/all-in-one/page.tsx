import ServerError from "@/components/ui/errors/ServerError";
import { LoaderData, loader as rowsListLoader } from "@/modules/rows/routes/Rows_List.server";
import RowsAllInOneRoute from "@/modules/rows/components/RowsAllInOneRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await rowsListLoader(props);
  const loaderData = await data.json() as LoaderData;
  
  // Convert NextJS-style meta array to Next.js Metadata
  const metadata: Metadata = {};
  if (loaderData?.meta) {
    for (const meta of loaderData.meta) {
      if ('title' in meta) {
        metadata.title = meta.title;
      }
    }
  }
  return metadata;
}

export default async function (props: IServerComponentsProps) {
  const response = await rowsListLoader(props);
  const data = await response.json() as LoaderData;
  
  return <RowsAllInOneRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
