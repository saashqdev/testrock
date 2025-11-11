import { generate } from "@/modules/codeGenerator/service/CodeGeneratorService";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";

export const loader = async (props: IServerComponentsProps) => {
  const params = (await props.params) || {};
  const request = props.request!;  
  await verifyUserHasPermission("admin.entities.view");
  const entity = await db.entities.getEntityByName({ tenantId: null, name: params.entity! });
  const file = await generate({
    type: "dynamic",
    entity,
    moduleDirectory: `./app/modules/codeGeneratorTests/` + entity.slug,
    routesDirectory: `./app/routes/admin/entities/code-generator/tests/` + entity.slug,
    deleteFilesOnFinish: false,
    // generateZip: false,
  });
  // if (!file) {
  //   return Response.json({ success: "Files generated successfully." }, { status: 200 });
  // }
  return new Response(null, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=${entity.slug}.zip`,
    },
  });
};
