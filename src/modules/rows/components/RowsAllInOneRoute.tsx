"use client";

import Link from "next/link";
import { useState, useCallback, useMemo } from "react";
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
  // Use data.rowsData.items directly as initial state and only update via manual state changes
  const [rows, setRows] = useState<RowWithDetailsDto[]>(() => data.rowsData.items);
  const [justCreated, setJustCreated] = useState<RowWithDetailsDto | null>(null);
  const [addingContact, setAddingContact] = useState(false);
  const [addingOpportunity, setAddingOpportunity] = useState(false);

  // Helper to get the base URL path for related entities
  const getRelatedEntityNewUrl = useCallback((entitySlug: string, companyId?: string) => {
    // Extract the base path from the current routes
    const currentPath = data.routes.list || "";
    // Replace the entity slug in the path
    const basePath = currentPath.replace(/\/entities\/[^\/]+\//, `/entities/${entitySlug}/`).replace(/\/[^\/]+$/, "");
    return companyId ? `${basePath}/${entitySlug}/new?company=${companyId}` : `${basePath}/${entitySlug}/new`;
  }, [data.routes.list]);

  // Get the contact and opportunity entities - memoize to prevent recalculation
  const contactEntity = useMemo(() => appOrAdminData?.entities?.find((e) => e.slug === "contacts"), [appOrAdminData?.entities]);
  const opportunityEntity = useMemo(() => appOrAdminData?.entities?.find((e) => e.slug === "opportunities"), [appOrAdminData?.entities]);

  const onCreated = useCallback((row: RowWithDetailsDto) => {
    setRows((prevRows) => [row, ...prevRows]);
    // For companies, show the action buttons after creation
    if (data.rowsData.entity.slug === "companies") {
      setJustCreated(row);
      // Keep the slideout open to show the buttons
      return;
    }
    setAdding(false);
  }, [data.rowsData.entity.slug]);

  const onUpdated = useCallback((row: RowWithDetailsDto) => {
    setRows((prevRows) => prevRows.map((r) => (r.id === row.id ? row : r)));
    setEditing(undefined);
  }, []);

  const onDeleted = useCallback((row: RowWithDetailsDto | undefined) => {
    if (row) {
      setRows((prevRows) => prevRows.filter((r) => r.id !== row.id));
      setEditing(undefined);
    }
  }, []);

  const handleNewRow = useCallback(() => {
    setAdding(true);
  }, []);

  const handleEditRow = useCallback((row: RowWithDetailsDto) => {
    setEditing(row);
  }, []);

  const handleCloseAdding = useCallback(() => {
    setAdding(false);
  }, []);

  const handleCloseEditing = useCallback(() => {
    setEditing(undefined);
  }, []);

  const handleCloseAddingContact = useCallback(() => {
    setAddingContact(false);
  }, []);

  const handleCloseAddingOpportunity = useCallback(() => {
    setAddingOpportunity(false);
  }, []);

  const handleContactCreated = useCallback((row: RowWithDetailsDto) => {
    setAddingContact(false);
    // TODO: Store contact ID to link when company is saved
  }, []);

  const handleOpportunityCreated = useCallback((row: RowWithDetailsDto) => {
    setAddingOpportunity(false);
    // TODO: Store opportunity ID to link when company is saved
  }, []);

  const handleContactLinkClick = useCallback(() => {
    setJustCreated(null);
    setAdding(false);
  }, []);

  const handleOpportunityLinkClick = useCallback(() => {
    setJustCreated(null);
    setAdding(false);
  }, []);

  // Memoize specific primitive values from appOrAdminData to prevent reference changes
  const userId = useMemo(() => appOrAdminData?.user?.id, [appOrAdminData?.user?.id]);
  const isSuperAdmin = useMemo(() => appOrAdminData?.isSuperAdmin, [appOrAdminData?.isSuperAdmin]);
  
  const permissions = useMemo(() => ({
    create: getUserHasPermission(appOrAdminData, getEntityPermission(data.rowsData.entity, "create")),
  }), [appOrAdminData?.permissions, data.rowsData.entity.id]);

  const currentSession = useMemo(() => 
    appOrAdminData?.user
      ? {
          user: appOrAdminData.user,
          isSuperAdmin: appOrAdminData.isSuperAdmin,
        }
      : null
  , [userId, isSuperAdmin]);

  // Memoize allEntities to avoid creating new array on every render
  const allEntities = useMemo(() => appOrAdminData?.entities ?? [], [appOrAdminData?.entities]);

  return (
    <div>
      <RowsViewRoute
        key={data.rowsData.entity.id}
        rowsData={data.rowsData}
        items={rows}
        routes={data.routes}
        onNewRow={handleNewRow}
        onEditRow={handleEditRow}
        saveCustomViews={true}
        permissions={permissions}
        currentSession={currentSession}
      />
      <SlideOverWideEmpty
        title={t("shared.create") + " " + t(data.rowsData?.entity.title ?? "")}
        size="2xl"
        open={adding}
        onClose={handleCloseAdding}
      >
        <RowNewFetcher
          url={EntityHelper.getRoutes({ routes: data.routes, entity: data.rowsData.entity })?.new ?? ""}
          onCreated={onCreated}
          allEntities={allEntities}
        />
        
        {/* Quick action buttons for companies - shown after save */}
        {data.rowsData.entity.slug === "companies" && justCreated && (
          <div className="mt-4 rounded-md border border-primary bg-primary/10 p-4">
            <p className="mb-3 text-sm font-medium text-foreground">✓ Company saved! What&apos;s next?</p>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Link
                href={getRelatedEntityNewUrl("contacts", justCreated.id)}
                onClick={handleContactLinkClick}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t("shared.add")} {t("models.contact.object")}
              </Link>
              <Link
                href={getRelatedEntityNewUrl("opportunities", justCreated.id)}
                onClick={handleOpportunityLinkClick}
                className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
              >
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t("shared.add")} {t("models.opportunity.object")}
              </Link>
            </div>
          </div>
        )}
      </SlideOverWideEmpty>



      <SlideOverWideEmpty
        title={editing ? RowHelper.getRowFolio(data.rowsData?.entity, editing) : ""}
        className="max-w-md"
        open={!!editing}
        onClose={handleCloseEditing}
        buttons={
          <>
            {data.rowsData.entity.slug === "companies" && editing && (
              <>
                <Link
                  href={getRelatedEntityNewUrl("contacts", editing.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title={`${t("shared.add")} ${t("models.contact.object")}`}
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="hidden sm:inline">{t("models.contact.object")}</span>
                </Link>
                <Link
                  href={getRelatedEntityNewUrl("opportunities", editing.id)}
                  className="inline-flex items-center gap-1 rounded-md bg-primary px-2.5 py-1.5 text-xs font-medium text-primary-foreground hover:bg-primary/90 focus:outline-hidden focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  title={`${t("shared.add")} ${t("models.opportunity.object")}`}
                >
                  <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                  <span className="hidden sm:inline">{t("models.opportunity.object")}</span>
                </Link>
              </>
            )}
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
          allEntities={allEntities}
          onUpdated={onUpdated}
          onDeleted={() => onDeleted(editing)}
        />
      </SlideOverWideEmpty>

      {/* Nested slideout for adding contact */}
      {data.rowsData.entity.slug === "companies" && contactEntity && (
        <SlideOverWideEmpty
          title={t("shared.add") + " " + t("models.contact.object")}
          size="xl"
          position={2}
          open={addingContact}
          onClose={handleCloseAddingContact}
        >
          <div className="space-y-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-medium">Note: This contact will be linked to the company after you save.</p>
            </div>
            <RowNewFetcher
              url={`/admin/entities/${contactEntity.slug}/no-code/${contactEntity.slug}/new`}
              onCreated={handleContactCreated}
              allEntities={allEntities}
            />
          </div>
        </SlideOverWideEmpty>
      )}

      {/* Nested slideout for adding opportunity */}
      {data.rowsData.entity.slug === "companies" && opportunityEntity && (
        <SlideOverWideEmpty
          title={t("shared.add") + " " + t("models.opportunity.object")}
          size="xl"
          position={2}
          open={addingOpportunity}
          onClose={handleCloseAddingOpportunity}
        >
          <div className="space-y-4">
            <div className="rounded-md border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <p className="font-medium">Note: This opportunity will be linked to the company after you save.</p>
            </div>
            <RowNewFetcher
              url={`/admin/entities/${opportunityEntity.slug}/no-code/${opportunityEntity.slug}/new`}
              onCreated={handleOpportunityCreated}
              allEntities={allEntities}
            />
          </div>
        </SlideOverWideEmpty>
      )}
    </div>
  );
}
