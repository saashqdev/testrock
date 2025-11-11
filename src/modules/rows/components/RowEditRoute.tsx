"use client";

import { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useRouter, useParams } from "next/navigation";
import RowForm from "@/components/entities/rows/RowForm";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getEntityPermission, getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import NewPageLayout from "@/components/ui/layouts/NewPageLayout";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { Rows_Edit } from "../routes/Rows_Edit.server";

type EditRowOptions = {
  hideTitle?: boolean;
  hideMenu?: boolean;
  hideShare?: boolean;
  hideTags?: boolean;
  hideTasks?: boolean;
  hideActivity?: boolean;
  disableUpdate?: boolean;
  disableDelete?: boolean;
};

interface Props {
  layout?: "edit" | "simple";
  children?: ReactNode;
  title?: ReactNode;
  rowFormChildren?: ReactNode;
  options?: EditRowOptions;
  data: Rows_Edit.LoaderData;
}

export default function RowEditRoute({ rowFormChildren, options, children, data }: Props) {
  const { rowData, routes, allEntities, relationshipRows } = data;
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const params = useParams();
  const { t } = useTranslation();

  if (!appOrAdminData) {
    return null;
  }

  return (
    <NewPageLayout
      title={t("shared.edit") + " " + t(rowData.entity.title)}
      menu={EntityHelper.getLayoutBreadcrumbsMenu({ 
        type: "edit", 
        t, 
        appOrAdminData, 
        entity: rowData.entity, 
        item: rowData.item, 
        params: {
          ...Object.fromEntries(
            Object.entries(params).map(([key, value]) => [
              key, 
              Array.isArray(value) ? value[0] : value
            ])
          ),
          appOrAdminData
        } as any, 
        routes 
      })}
    >
      <RowForm
        allEntities={allEntities}
        entity={rowData.entity}
        routes={routes}
        item={rowData.item}
        editing={true}
        canDelete={
          !options?.disableDelete &&
          getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "delete")) &&
          (rowData.rowPermissions.canDelete || appOrAdminData.isSuperUser)
        }
        canUpdate={
          !options?.disableUpdate &&
          getUserHasPermission(appOrAdminData, getEntityPermission(rowData.entity, "update")) &&
          (rowData.rowPermissions.canDelete || appOrAdminData.isSuperUser)
        }
        relationshipRows={relationshipRows}
        onCancel={() => router.push(EntityHelper.getRoutes({ routes, entity: rowData.entity, item: rowData.item })?.overview ?? "")}
        promptFlows={rowData.allPromptFlows}
      >
        {rowFormChildren}
      </RowForm>
      {children}
    </NewPageLayout>
  );
}
