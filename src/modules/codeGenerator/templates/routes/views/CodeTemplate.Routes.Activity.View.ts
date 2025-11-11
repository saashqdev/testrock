import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import RowActivity from "@/components/entities/rows/RowActivity";
import { ${capitalized}RoutesActivityApi } from "../api/${capitalized}Routes.Activity.Api";
import { useLoaderData } from "next/navigation";

export default function ${capitalized}RoutesActivityView() {
  const data = useLoaderData<${capitalized}RoutesActivityApi.LoaderData>();
  return <RowActivity items={data.logs} withTitle={false} hasActivity={true} hasComments={data.permissions.canComment} />;
}
`;
}

export default {
  generate,
};
