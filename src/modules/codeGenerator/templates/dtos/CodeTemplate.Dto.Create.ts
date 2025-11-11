import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  const code: string[] = [];

  code.push("");
  code.push(`export type ${capitalized}CreateDto = {`);
  entity.properties
    .filter((f) => !f.isDefault && f.showInCreate)
    .forEach((property) => {
      CodeGeneratorPropertiesHelper.type({ code, imports, property });
    });
  code.push("};");

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, ...code].join("\n");
}

export default {
  generate,
};
