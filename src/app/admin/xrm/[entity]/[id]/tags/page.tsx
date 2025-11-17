import ServerError from "@/components/ui/errors/ServerError";
import RowTagsRoute from "@/modules/rows/components/RowTagsRoute";
import { loader as rowTagsLoader, action as rowTagsAction } from "@/modules/rows/routes/Rows_Tags.server";
import { serverTimingHeaders } from "@/modules/metrics/utils/defaultHeaders.server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export { serverTimingHeaders as headers };

export const loader = (props: IServerComponentsProps) => rowTagsLoader(props);
export const action = (props: IServerComponentsProps) => rowTagsAction(props);

export default () => <RowTagsRoute />;

export function ErrorBoundary() {
  return <ServerError />;
}
