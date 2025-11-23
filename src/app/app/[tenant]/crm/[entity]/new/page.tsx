import ServerError from "@/components/ui/errors/ServerError";
import RowNewRoute from "@/modules/rows/components/RowNewRoute";
import * as RowsNew from "@/modules/rows/routes/Rows_New.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import type { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await RowsNew.loader(props);
  const loaderData = (await data.json()) as RowsNew.LoaderData;

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
export const loader = (props: IServerComponentsProps) => RowsNew.loader(props);
export const action = (props: IServerComponentsProps) => RowsNew.action(props);

export default async function Page(props: IServerComponentsProps) {
  const response = await RowsNew.loader(props);
  const data = (await response.json()) as RowsNew.LoaderData;
  return <RowNewRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
