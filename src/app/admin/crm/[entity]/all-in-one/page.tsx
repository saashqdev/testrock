import ServerError from "@/components/ui/errors/ServerError";
import { Rows_List } from "@/modules/rows/routes/Rows_List.server";
import RowsAllInOneRoute from "@/modules/rows/components/RowsAllInOneRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await Rows_List.loader(props);
  const loaderData = await data.json() as Rows_List.LoaderData;
  
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
export const loader = (props: IServerComponentsProps) => Rows_List.loader(props);
export const action = (props: IServerComponentsProps) => Rows_List.action(props);

export default async function (props: IServerComponentsProps) {
  const response = await Rows_List.loader(props);
  const data = await response.json() as Rows_List.LoaderData;
  
  return <RowsAllInOneRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
