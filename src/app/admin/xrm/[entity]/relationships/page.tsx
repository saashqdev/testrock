import ServerError from "@/components/ui/errors/ServerError";
import { Rows_Relationships } from "@/modules/rows/routes/Rows_Relationships.server";
import RowsRelationshipsRoute from "@/modules/rows/components/RowsRelationshipsRoute";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => Rows_Relationships.loader(props);

export default async function Page(props: IServerComponentsProps) {
  const response = await Rows_Relationships.loader(props);
  const data = await response.json() as Rows_Relationships.LoaderData;
  return <RowsRelationshipsRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
