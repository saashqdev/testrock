import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized, name, title } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { LoaderFunctionArgs } from "next/navigation";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { getServerTranslations } from "@/i18n/server";
import { getEntityByName } from "~/utils/db/entities/entities.db.server";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import { getUserInfo } from "@/lib/services/session.server";
import { MetaTagsDto } from "@/lib/dtos/seo/MetaTagsDto";`);
  imports.push(`import { ${capitalized}Dto } from "../../dtos/${capitalized}Dto";
import { ${capitalized}Service } from "../../services/${capitalized}Service";`);

  let template = `
export type LoaderData = {
  metatags: MetaTagsDto;
  items: ${capitalized}Dto[];
  pagination: PaginationDto;
  filterableProperties?: FilterablePropertyDto[];
  overviewItem?: ${capitalized}Dto | null;
};

export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
  const { t } = await getServerTranslations();
  const tenantId = await getTenantIdOrNull({ request, params });
  const userId = (await getUserInfo(request)).userId;
  const urlSearchParams = new URL(request.url).searchParams;
  const { items, pagination } = await ${capitalized}Service.getAll({
    tenantId,
    userId,
    urlSearchParams,
  });
  const data: LoaderData = {
    metatags: [{ title: "${title} | " + process.env.APP_NAME }],
    items,
    pagination,
    filterableProperties: EntityHelper.getFilters({ t, entity: await getEntityByName({ tenantId, name: "${name}" }) }),
  };
  const overviewId = urlSearchParams.get("overview") ?? "";
  if (overviewId) {
    data.overviewItem = await ${capitalized}Service.get(overviewId, {
      tenantId,
      userId,
    });
  }
  return data;
};`;

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
