import ServerError from "@/components/ui/errors/ServerError";
import RowShareRoute from "@/modules/rows/components/RowShareRoute";
import * as RowsShare from "@/modules/rows/routes/Rows_Share.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => RowsShare.loader(props);
export const action = (props: IServerComponentsProps) => RowsShare.action(props);

export default async function SharePage(props: IServerComponentsProps) {
  const response = await RowsShare.loader(props);
  const data = await response.json() as RowsShare.LoaderData;
  return <RowShareRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
