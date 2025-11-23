"use client";

import { useTranslation } from "react-i18next";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import CheckPlanFeatureLimit from "@/components/core/settings/subscription/CheckPlanFeatureLimit";
import RowForm from "@/components/entities/rows/RowForm";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import { GetEntityData, Routes } from "@/utils/api/server/EntitiesApi";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowHelper from "@/lib/helpers/RowHelper";
import clsx from "clsx";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { LoaderData, ActionData } from "../routes/Rows_New.server";
import { Fragment, useEffect, useState } from "react";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import toast from "react-hot-toast";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";

interface Props {
  showBreadcrumb?: boolean;
  className?: string;
  data?: LoaderData;
}
export default function RowNewRoute({ showBreadcrumb = true, className, data: initialData }: Props) {
  const appOrAdminData = useAppOrAdminData();
  const [data, setData] = useState<LoaderData | null>(initialData || null);
  const [loading, setLoading] = useState(!initialData);
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();

  const [selectedTemplate, setSelectedTemplate] = useState<{ title: string; config: string } | null>(null);

  // Fetch data if not provided as prop
  useEffect(() => {
    if (!initialData && !data) {
      const fetchData = async () => {
        try {
          setLoading(true);
          const response = await fetch(`/api/rows/${params.entity}/new`);
          if (!response.ok) {
            throw new Error("Failed to fetch data");
          }
          const fetchedData = await response.json();
          setData(fetchedData);
        } catch (error) {
          console.error("Error fetching data:", error);
          toast.error("Failed to load page data");
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [initialData, data, params.entity]);

  // Handle form submission
  const handleFormSubmit = async (formData: FormData) => {
    try {
      const response = await fetch(`/api/rows/${params.entity}/new`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        setActionData({ error: errorData.error || "Something went wrong" });
        return;
      }

      const result = await response.json();
      setActionData(result);

      // Handle redirects based on response
      if (result.redirect) {
        router.push(result.redirect);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setActionData({ error: "Failed to submit form" });
    }
  };

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData, t]);

  if (loading) {
    return (
      <NewPageLayout className={className} title={t("shared.loading")} menu={[]}>
        <div className="flex items-center justify-center p-8">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </NewPageLayout>
    );
  }

  if (!data) {
    return (
      <NewPageLayout className={className} title={t("shared.error")} menu={[]}>
        <div className="flex items-center justify-center p-8">
          <div className="text-destructive">Failed to load page data</div>
        </div>
      </NewPageLayout>
    );
  }

  return (
    <Fragment>
      <NewPageLayout
        className={className}
        title={t("shared.create") + " " + t(data.entityData.entity.title)}
        menu={
          showBreadcrumb && appOrAdminData
            ? EntityHelper.getLayoutBreadcrumbsMenu({
                type: "new",
                t,
                appOrAdminData,
                entity: data.entityData.entity,
                item: undefined,
                params: { ...params, appOrAdminData } as any,
                routes: data.routes,
              })
            : []
        }
      >
        {data.entityData.entity.templates.length > 0 && (
          <div className="space-y-1">
            {/* <label htmlFor="template" className="text-sm font-medium leading-3 text-foreground">
              {t("models.entity.templates")}
            </label> */}
            <div className="flex flex-wrap space-x-2">
              {data.entityData.entity.templates
                .sort((a, b) => (new Date(b.createdAt).getTime() > new Date(a.createdAt).getTime() ? -1 : 1))
                .map((template) => {
                  return (
                    <button
                      type="button"
                      key={template.title}
                      className={clsx(
                        "rounded-md border bg-background p-2 text-sm font-medium",
                        selectedTemplate?.title === template.title
                          ? "border border-border"
                          : "border-dashed border-border hover:border-dotted hover:bg-secondary"
                      )}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      {template.title}
                    </button>
                  );
                })}
            </div>
          </div>
        )}

        <div className="space-y-4">
          {actionData?.newRow && actionData?.saveAndAdd ? (
            <RowCreated entityData={data.entityData} routes={data.routes} newRow={actionData?.newRow} />
          ) : (
            <CheckPlanFeatureLimit item={data.entityData.featureUsageEntity}>
              <RowForm
                key={actionData?.newRow?.id || selectedTemplate?.title}
                entity={data.entityData.entity}
                routes={data.routes}
                onCreatedRedirect={data.entityData.entity.onCreated ?? undefined}
                allEntities={data.allEntities}
                relationshipRows={data.relationshipRows}
                adding={true}
                template={selectedTemplate}
                onSubmit={handleFormSubmit}
              />
            </CheckPlanFeatureLimit>
          )}
        </div>
      </NewPageLayout>
    </Fragment>
  );
}

function RowCreated({ entityData, routes, newRow }: { entityData: GetEntityData; routes: Routes; newRow: RowWithDetailsDto }) {
  const { t } = useTranslation();
  // const params = useParams();
  return (
    <div>
      {/* <NotificationSimple /> */}
      <div className="text-sm font-medium text-foreground">{t("shared.created")}</div>
      <div className="group relative mt-2 w-full rounded-md border-2 border-dashed border-border bg-background text-left text-sm hover:border-border">
        <Link href={EntityHelper.getRoutes({ routes, entity: entityData.entity, item: newRow })?.overview ?? ""} className="grid grid-cols-2 gap-2 px-4 py-3">
          {entityData.entity.properties.filter((f) => f.isDisplay).length === 0 ? (
            <div>{RowHelper.getTextDescription({ entity: entityData.entity, item: newRow, t })}</div>
          ) : (
            <>
              {entityData.entity.properties
                .filter((f) => f.isDisplay)
                .sort((a, b) => a.order - b.order)
                .map((property, idx) => (
                  <div key={property.id} className={clsx(idx === 0 ? "font-medium text-foreground/80" : "text-muted-foreground")}>
                    <div className="flex flex-col">
                      <div className="text-xs uppercase text-muted-foreground">{t(property.title)}</div>
                      <div>{RowHelper.getCellValue({ entity: entityData.entity, property, item: newRow })}</div>
                    </div>
                  </div>
                ))}
            </>
          )}
        </Link>
      </div>
      <div className="mt-2 flex justify-between space-x-2">
        <ButtonSecondary to={EntityHelper.getRoutes({ routes, entity: entityData.entity })?.list}>{t("shared.viewAll")}</ButtonSecondary>

        <div className="items-between flex space-x-2">
          <ButtonSecondary to={EntityHelper.getRoutes({ routes, entity: entityData.entity, item: newRow })?.overview}>{t("shared.view")}</ButtonSecondary>
          <ButtonPrimary autoFocus to=".">
            {t("shared.addAnother")}
          </ButtonPrimary>
        </div>
      </div>
    </div>
  );
}
