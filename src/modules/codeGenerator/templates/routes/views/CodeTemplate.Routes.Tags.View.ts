import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  return `import RowSettingsTags from "@/components/entities/rows/RowSettingsTags";
import { ${capitalized}RoutesTagsApi } from "../api/${capitalized}Routes.Tags.Api";
import { useLoaderData } from "next/navigation";

export default function ${capitalized}RoutesTagsView() {
  const data = useLoaderData<${capitalized}RoutesTagsApi.LoaderData>();
  return <RowSettingsTags item={data.item.row} tags={data.tags} />;
}
`;
}

export default {
  generate,
};
