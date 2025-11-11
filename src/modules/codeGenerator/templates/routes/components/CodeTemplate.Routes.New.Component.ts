import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity, moduleLocation }: { entity: EntityWithDetailsDto; moduleLocation: string }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { MetaFunction, LoaderFunctionArgs, ActionFunction } from "next/navigation";
import ServerError from "@/components/ui/errors/ServerError";
import { ${capitalized}RoutesNewApi } from "~/${moduleLocation}/routes/api/${capitalized}Routes.New.Api";
import ${capitalized}RoutesNewView from "~/${moduleLocation}/routes/views/${capitalized}Routes.New.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);
export const loader = (args: LoaderFunctionArgs) => ${capitalized}RoutesNewApi.loader(args);
export const action: ActionFunction = (args) => ${capitalized}RoutesNewApi.action(args);

export default () => <${capitalized}RoutesNewView />;

export function ErrorBoundary() {
  return <ServerError />;
}
`;
}

export default {
  generate,
};
