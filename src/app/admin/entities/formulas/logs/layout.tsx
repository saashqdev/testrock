import { Metadata } from "next";
import { getServerTranslations } from "@/i18n/server";
import { FormulaLogWithDetailsDto } from "@/db/models/entityBuilder/FormulaLogsModel";
import { FormulaCalculationTriggerTypes } from "@/modules/formulas/dtos/FormulaDto";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getFiltersFromCurrentUrl, getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { FilterablePropertyDto } from "@/lib/dtos/data/FilterablePropertyDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import FormulaLogsClient from "./FormulasLogsClient";

type LoaderData = {
  title: string;
  items: FormulaLogWithDetailsDto[];
  filterableProperties: FilterablePropertyDto[];
  pagination: PaginationDto;
  allEntities: EntityWithDetailsDto[];
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const params = (await props.params) || {};
  await verifyUserHasPermission("admin.formulas.view");
  const { t } = await getServerTranslations();

  const urlSearchParams = new URL(request.url).searchParams;
  const pagination = getPaginationFromCurrentUrl(urlSearchParams);

  const filterableProperties: FilterablePropertyDto[] = [
    {
      name: "formulaId",
      title: "Formula",
      options: (await db.formulas.getAllFormulasIdsAndNames()).map((item) => {
        return { value: item.id, name: item.name };
      }),
    },
    {
      name: "status",
      title: "Status",
      manual: true,
      options: [
        { name: "Success", value: "success" },
        { name: "Error", value: "error" },
        { name: "No result", value: "empty" },
      ],
    },
    {
      name: "originalTrigger",
      title: "Original Trigger",
      options: FormulaCalculationTriggerTypes.map((item) => ({ name: item, value: item })),
    },
    {
      name: "triggeredBy",
      title: "Triggered By",
      options: FormulaCalculationTriggerTypes.map((item) => ({ name: item, value: item })),
    },
    {
      name: "hasRowId",
      title: "Has Row",
      manual: true,
    },
    {
      name: "rowValueId",
      title: "Row value id",
    },
    {
      name: "tenantId",
      title: t("models.tenant.object"),
      options: (await db.tenants.adminGetAllTenantsIdsAndNames()).map((item) => {
        return {
          value: item.id,
          name: item.name,
        };
      }),
    },
    {
      name: "userId",
      title: t("models.user.object"),
      options: (await db.users.adminGetAllUsersNames()).map((item) => {
        return {
          value: item.id,
          name: item.email,
        };
      }),
    },
  ];
  const filters = getFiltersFromCurrentUrl(request, filterableProperties);

  const logs = await db.formulaLogs.getFormulaLogs({
    id: params.id!,
    pagination: { pageSize: pagination.pageSize, page: pagination.page },
    filters,
  });
  const allEntities = await db.entities.getAllEntities(null);
  const data: LoaderData = {
    title: `Formula Logs | ${process.env.APP_NAME}`,
    items: logs.items,
    filterableProperties,
    pagination: {
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalItems: logs.total,
      totalPages: Math.ceil(logs.total / pagination.pageSize),
    },
    allEntities,
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  return {
    title: `Formula Logs | ${process.env.APP_NAME}`,
  };
}

export default async function FormulaLogsPage(props: IServerComponentsProps) {
  const data = await getLoaderData(props);

  return <FormulaLogsClient data={data} />;
}
