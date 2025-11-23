import RowsImportRoute from "@/modules/rows/components/RowsImportRoute";
import { LoaderData, loader as importLoader } from "@/modules/rows/routes/Rows_Import.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import type { Metadata } from "next";

export { serverTimingHeaders as headers };

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await importLoader(props);
  const loaderData = (await data.json()) as LoaderData;

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

export default () => <RowsImportRoute />;
