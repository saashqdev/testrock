import ServerError from "@/components/ui/errors/ServerError";
import { LoaderData, loader as loaderFn } from "@/modules/rows/routes/Rows_Relationships.server";
import RowsRelationshipsRoute from "@/modules/rows/components/RowsRelationshipsRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export default async function Page(props: IServerComponentsProps) {
  const response = await loaderFn(props);
  const data = await response.json() as LoaderData;
  return <RowsRelationshipsRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
