import ServerError from "@/components/ui/errors/ServerError";
import * as RowsList from "@/modules/rows/routes/Rows_List.server";
import RowsAllInOneRoute from "@/modules/rows/components/RowsAllInOneRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await RowsList.loader(props);
  const loaderData = (await data.json()) as RowsList.LoaderData;

  // Convert NextJS-style meta array to Next.js Metadata
  const metadata: Metadata = {};
  if (loaderData?.meta) {
    for (const meta of loaderData.meta) {
      if ("title" in meta) {
        metadata.title = meta.title;
      }
    }
  }
  return metadata;
}
export const loader = (props: IServerComponentsProps) => RowsList.loader(props);
export const action = (props: IServerComponentsProps) => RowsList.action(props);

export default async function (props: IServerComponentsProps) {
  const response = await RowsList.loader(props);
  const data = (await response.json()) as RowsList.LoaderData;

  return <RowsAllInOneRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
