"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import RowEditFetcher from "@/modules/rows/fetchers/RowEditFetcher";
import RowNewFetcher from "@/modules/rows/fetchers/RowNewFetcher";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import RowHelper from "@/lib/helpers/RowHelper";
import { Rows_List } from "../routes/Rows_List.server";
import RowsViewRoute from "./RowsViewRoute";
import { getEntityPermission, getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

export default function RowsAllInOneRoute({ data }: { data: Rows_List.LoaderData }) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<RowWithDetailsDto>();
  const [rows, setRows] = useState<RowWithDetailsDto[]>([]);

  useEffect(() => {
    setRows(data.rowsData.items);
  }, [data.rowsData.items]);

  function onCreated(row: RowWithDetailsDto) {
    setRows([row, ...rows]);
    setAdding(false);
  }
  function onUpdated(row: RowWithDetailsDto) {
    setRows(rows.map((r) => (r.id === row.id ? row : r)));
    setEditing(undefined);
  }
  function onDeleted(row: RowWithDetailsDto | undefined) {
    if (row) {
      setRows(rows.filter((r) => r.id !== row.id));
      setEditing(undefined);
    }
  }

  return (
    <div>
      <RowsViewRoute
        key={data.rowsData.entity.id}
        rowsData={data.rowsData}
        items={rows}
        routes={data.routes}
        onNewRow={() => setAdding(true)}
        onEditRow={(row) => setEditing(row)}
        saveCustomViews={true}
        permissions={{
          create: getUserHasPermission(appOrAdminData, getEntityPermission(data.rowsData.entity, "create")),
        }}
        currentSession={
          appOrAdminData
            ? {
                user: appOrAdminData.user,
                isSuperAdmin: appOrAdminData.isSuperAdmin,
              }
            : null
        }
      />
      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data.rowsData?.entity.title ?? "")}
        className="max-w-md"
        open={adding}
        onClose={() => setAdding(false)}
      >
        <RowNewFetcher
          url={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity })?.new ?? ""}
          onCreated={onCreated}
          allEntities={appOrAdminData?.entities ?? []}
        />
      </SlideOverWideEmpty>

      <SlideOverWideEmpty
        title={editing ? RowHelper.getRowFolio(data.rowsData?.entity, editing) : ""}
        className="max-w-md"
        open={!!editing}
        onClose={() => setEditing(undefined)}
        buttons={
          <>
            <Link
              href={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity, item: editing })?.overview ?? ""}
              className="focus:outline-hidden rounded-md bg-background text-muted-foreground hover:text-muted-foreground focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close panel</span>
              <ExternalLinkEmptyIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
          </>
        }
      >
        <RowEditFetcher
          url={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity, item: editing })?.edit ?? ""}
          allEntities={appOrAdminData?.entities ?? []}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(editing)}
        />
      </SlideOverWideEmpty>
    </div>
  );
}
