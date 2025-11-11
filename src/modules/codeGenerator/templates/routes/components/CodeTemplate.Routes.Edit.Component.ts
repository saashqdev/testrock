import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity, moduleLocation }: { entity: EntityWithDetailsDto; moduleLocation: string }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { MetaFunction, LoaderFunctionArgs, ActionFunction } from "next/navigation";
import ServerError from "@/components/ui/errors/ServerError";
import { ${capitalized}RoutesEditApi } from "~/${moduleLocation}/routes/api/${capitalized}Routes.Edit.Api";
import ${capitalized}RoutesEditView from "~/${moduleLocation}/routes/views/${capitalized}Routes.Edit.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);
export const loader = (args: LoaderFunctionArgs) => ${capitalized}RoutesEditApi.loader(args);
export const action: ActionFunction = (args) => ${capitalized}RoutesEditApi.action(args);

export default () => <${capitalized}RoutesEditView />;

export function ErrorBoundary() {
  return <ServerError />;
}
`;
}

export default {
  generate,
};
