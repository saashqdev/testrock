import ServerError from "@/components/ui/errors/ServerError";
import * as RowsRelationships from "@/modules/rows/routes/Rows_Relationships.server";
import RowsRelationshipsRoute from "@/modules/rows/components/RowsRelationshipsRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => RowsRelationships.loader(props);

export default async function Page(props: IServerComponentsProps) {
  const response = await RowsRelationships.loader(props);
  const data = (await response.json()) as RowsRelationships.LoaderData;
  return <RowsRelationshipsRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
