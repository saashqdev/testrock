import ServerError from "@/components/ui/errors/ServerError";
import RowNewRoute from "@/modules/rows/components/RowNewRoute";
import { Rows_New } from "@/modules/rows/routes/Rows_New.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import type { Metadata } from "next";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await Rows_New.loader(props);
  const loaderData = await data.json() as Rows_New.LoaderData;

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

export const loader = (props: IServerComponentsProps) => Rows_New.loader(props);
export const action = (props: IServerComponentsProps) => Rows_New.action(props);

export default () => <RowNewRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
