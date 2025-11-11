import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import RowSettingsPermissions from "@/components/entities/rows/RowSettingsPermissions";
import { ${capitalized}RoutesShareApi } from "../api/${capitalized}Routes.Share.Api";
import { useLoaderData } from "next/navigation";

export default function ${capitalized}RoutesShareView() {
  const data = useLoaderData<${capitalized}RoutesShareApi.LoaderData>();
  return <RowSettingsPermissions item={data.item.row} items={data.item.row.permissions} tenants={data.tenants} users={data.users} />;
}
`;
}

export default {
  generate,
};
