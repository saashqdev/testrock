import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized, name } = CodeGeneratorHelper.getNames(entity);

  const code: string[] = [
    `model ${capitalized} {
  id  String @id @unique
  row Row    @relation(fields: [id], references: [id], onDelete: Cascade)`,
  ];

  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property) => {
      CodeGeneratorPropertiesHelper.schema({ code, property });
    });

  code.push("}");

  code.push("");

  code.push(`// Add at the end of the Row model
model Row {
//   ...
  ${name}           ${capitalized}?
}`);

  return [...code].join("\n");
}

export default {
  generate,
};
