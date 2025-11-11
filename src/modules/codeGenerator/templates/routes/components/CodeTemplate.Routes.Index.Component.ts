import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity, moduleLocation }: { entity: EntityWithDetailsDto; moduleLocation: string }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import { MetaFunction, LoaderFunctionArgs } from "next/navigation";
import ServerError from "@/components/ui/errors/ServerError";
import { ${capitalized}RoutesIndexApi } from "~/${moduleLocation}/routes/api/${capitalized}Routes.Index.Api";
import ${capitalized}RoutesIndexView from "~/${moduleLocation}/routes/views/${capitalized}Routes.Index.View";

export const meta: MetaFunction<typeof loader> = ({ data }) => (data && "metatags" in data ? data.metatags : []);
export const loader = (args: LoaderFunctionArgs) => ${capitalized}RoutesIndexApi.loader(args);

export default () => <${capitalized}RoutesIndexView />;

export function ErrorBoundary() {
  return <ServerError />;
}
`;
}

export default {
  generate,
};
