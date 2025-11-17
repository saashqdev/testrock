import ServerError from "@/components/ui/errors/ServerError";
import RowTagsRoute from "@/modules/rows/components/RowTagsRoute";
import { loader, action } from "@/modules/rows/routes/Rows_Tags.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => loader(props);
export const action = (props: IServerComponentsProps) => action(props);

export default () => <RowTagsRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
