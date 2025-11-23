import Link from "next/link";
import { Metadata } from "next";
import { Colors } from "@/lib/enums/shared/Colors";
import RowsList from "@/components/entities/rows/RowsList";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import CrmService, { CrmSummaryDto } from "@/modules/crm/services/CrmService";
import { Routes, getNoCodeRoutes } from "@/utils/api/server/EntitiesApi";
import { RowDisplayDefaultProperty } from "@/lib/helpers/PropertyHelper";
import { requireAuth } from "@/lib/services/loaders.middleware";
import { getTenantIdOrNull } from "@/utils/services/server/urlService";
import NumberUtils from "@/lib/shared/NumberUtils";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { getServerTranslations } from "@/i18n/server";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { db } from "@/db";

type LoaderData = {
  title: string;
  summary: CrmSummaryDto;
  routes: Routes;
  submissionEntity: EntityWithDetailsDto | null;
};

async function getLoaderData(props: IServerComponentsProps): Promise<LoaderData> {
  const request = props.request!;
  const params = (await props.params) || {};
  await requireAuth();
  const tenantId = await getTenantIdOrNull({ request, params });
  const data: LoaderData = {
    title: `CRM | ${process.env.APP_NAME}`,
    summary: await CrmService.getSummary(tenantId),
    routes: getNoCodeRoutes({ request, params }),
    submissionEntity: await db.entities.getEntityByName({ tenantId, name: "submission" }),
  };
  return data;
}

export async function generateMetadata(props: IServerComponentsProps): Promise<Metadata> {
  const data = await getLoaderData(props);
  return {
    title: data.title,
  };
}

export default async function CrmIndexPage(props: IServerComponentsProps) {
  const { t } = await getServerTranslations();
  const data = await getLoaderData(props);
  const params = (await props.params) || {};
  return (
    <div className="mx-auto mb-12 max-w-5xl space-y-5 px-4 py-4 sm:px-6 lg:px-8 xl:max-w-7xl">
      <div className="border-b border-border pb-5">
        <h3 className="text-lg font-medium leading-6 text-foreground">{t("shared.overview")}</h3>
      </div>
      <dl className="grid gap-2 sm:grid-cols-4">
        <Link
          href={params.tenant ? `/app/${params.tenant}/crm/companies` : "/admin/xrm/companies"}
          className="shadow-xs overflow-hidden rounded-lg border border-border bg-background px-4 py-3 hover:bg-secondary"
        >
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">Companies</dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.summary.companies)}</dd>
        </Link>
        <Link
          href={params.tenant ? `/app/${params.tenant}/crm/contacts` : "/admin/xrm/contacts"}
          className="shadow-xs overflow-hidden rounded-lg border border-border bg-background px-4 py-3 hover:bg-secondary"
        >
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">Contacts</dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.summary.contacts)}</dd>
        </Link>
        <Link
          href={params.tenant ? `/app/${params.tenant}/crm/opportunities` : "/admin/xrm/opportunities"}
          className="shadow-xs overflow-hidden rounded-lg border border-border bg-background px-4 py-3 hover:bg-secondary"
        >
          <dt className="flex items-center space-x-2 truncate text-xs font-medium uppercase text-muted-foreground">
            <ColorBadge color={Colors.GREEN} />
            <div>Opportunities</div>
          </dt>
          <dd className="mt-1 flex items-baseline space-x-1 truncate text-2xl font-semibold text-foreground">
            <div>${NumberUtils.numberFormat(data.summary.opportunities.value)}</div>
            <div className="text-xs font-normal lowercase text-muted-foreground">
              from {NumberUtils.intFormat(data.summary.opportunities.count)} opportunities
            </div>
          </dd>
        </Link>
        <Link
          href={params.tenant ? `/app/${params.tenant}/crm/submissions` : "/admin/xrm/submissions"}
          className="shadow-xs overflow-hidden rounded-lg border border-border bg-background px-4 py-3 hover:bg-secondary"
        >
          <dt className="truncate text-xs font-medium uppercase text-muted-foreground">Submissions</dt>
          <dd className="mt-1 truncate text-2xl font-semibold text-foreground">{NumberUtils.intFormat(data.summary.submissions)}</dd>
        </Link>
      </dl>

      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-2">
          <h3 className="text-sm font-medium text-muted-foreground">Opportunities</h3>
          <Link
            href={params.tenant ? `/app/${params.tenant}/crm/opportunities/new` : `/admin/xrm/opportunities/new`}
            className="rounded-full bg-secondary p-1 text-foreground hover:bg-secondary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
            </svg>
          </Link>
        </div>
        <RowsList
          view="board"
          entity="opportunity"
          items={data.summary.data.openOpportunities}
          readOnly={true}
          columns={[
            { name: "name", title: "Name", visible: true },
            { name: "value", title: "Value", visible: true },
            { name: "expectedCloseDate", title: "Expected Close Date", visible: true },
            { name: RowDisplayDefaultProperty.CREATED_AT, title: t("shared.createdAt"), visible: true },
            { name: RowDisplayDefaultProperty.CREATED_BY, title: t("shared.createdBy"), visible: true },
          ]}
          routes={data.routes}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between space-x-2">
          <h3 className="text-sm font-medium text-muted-foreground">Submissions</h3>
        </div>
        {data.submissionEntity ? (
          <RowsList
            view="table"
            entity={data.submissionEntity}
            items={data.summary.data.submissions}
            readOnly={true}
            columns={[
              { name: RowDisplayDefaultProperty.FOLIO, title: "", visible: true },
              { name: "users", title: "Users", visible: true },
              { name: "message", title: "Message", visible: true },
              { name: "parent.contact", title: "Contact", visible: true },
              { name: RowDisplayDefaultProperty.CREATED_AT, title: t("shared.createdAt"), visible: true },
            ]}
            routes={data.routes}
          />
        ) : (
          <div className="text-sm text-muted-foreground">
            Submission entity not found. Please import the CRM entities template from{" "}
            <Link href="/admin/entities/templates/manual" className="underline">
              /admin/entities/templates/manual
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
