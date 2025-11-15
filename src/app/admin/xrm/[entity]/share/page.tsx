import ServerError from "@/components/ui/errors/ServerError";
import RowShareRoute from "@/modules/rows/components/RowShareRoute";
import { Rows_Share } from "@/modules/rows/routes/Rows_Share.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => Rows_Share.loader(props);
export const action = (props: IServerComponentsProps) => Rows_Share.action(props);

export default async function SharePage(props: IServerComponentsProps) {
  const response = await Rows_Share.loader(props);
  const data = await response.json() as Rows_Share.LoaderData;
  return <RowShareRoute data={data} />;
}

export function ErrorBoundary() {
  return <ServerError />;
}
