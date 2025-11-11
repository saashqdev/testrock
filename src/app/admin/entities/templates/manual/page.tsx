"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import PreviewEntitiesTemplate from "@/components/entities/templates/PreviewEntitiesTemplate";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ServerError from "@/components/ui/errors/ServerError";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import * as DefaultEntityTemplates from "@/modules/templates/defaultEntityTemplates";
import { EntitiesTemplateDto } from "@/modules/templates/EntityTemplateDto";

type ActionData = {
  previewTemplate?: EntitiesTemplateDto;
  success?: string;
  error?: string;
};

const defaultTemplates: { title: string; template: EntitiesTemplateDto }[] = [
  { title: "Default: CRM", template: DefaultEntityTemplates.CRM_ENTITIES_TEMPLATE },
  { title: "Default: Tenant Settings", template: DefaultEntityTemplates.TENANT_SETTINGS_ENTITIES_TEMPLATE },
  { title: "Example: Employee", template: DefaultEntityTemplates.EMPLOYEES_ENTITIES_TEMPLATE },
  { title: "Example: Contracts", template: DefaultEntityTemplates.CONTRACTS_ENTITIES_TEMPLATE },
  { title: "Example: All Property Types Entity", template: DefaultEntityTemplates.ALL_PROPERTY_TYPES_ENTITY_TEMPLATE },
];

export default function AdminEntityTemplatesManual() {
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [configuration, setConfiguration] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  const handlePreview = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/entities/templates/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ configuration }),
        });
        const data = await response.json();
        setActionData(data);
      } catch (error: any) {
        setActionData({ error: error.message });
      }
    });
  };

  const handleCreate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/entities/templates/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ configuration }),
        });
        const data = await response.json();
        setActionData(data);
      } catch (error: any) {
        setActionData({ error: error.message });
      }
    });
  };

  return (
    <EditPageLayout
      title="Upload a JSON configuration"
      withHome={false}
      menu={[
        {
          title: "Templates",
          routePath: "/admin/entities/templates",
        },
        {
          title: "Manual",
          routePath: "/admin/entities/templates/manual",
        },
      ]}
    >
      <div className="md:border-border md:border-t md:py-2">
        {actionData?.error ? (
          <>
            <p id="form-error-message" className="py-2 text-sm text-rose-500" role="alert">
              {actionData.error}
            </p>
          </>
        ) : actionData?.success ? (
          <>
            <p id="form-success-message" className="text-text-500 py-2 text-sm" role="alert">
              {actionData.success}
            </p>
            <Link href="/admin/entities" className="text-theme-600 hover:text-theme-500 text-sm font-medium underline">
              Go to entities
            </Link>
          </>
        ) : actionData?.previewTemplate === undefined ? (
          <>
            <form onSubmit={handlePreview}>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {defaultTemplates.map((t) => (
                    <button
                      key={t.title}
                      type="button"
                      onClick={() => setConfiguration(JSON.stringify(t.template, null, "\t"))}
                      className="bg-theme-100 text-theme-700 hover:bg-theme-200 focus:ring-ring inline-flex items-center rounded border border-transparent px-2.5 py-1.5 text-xs font-medium focus:outline-hidden focus:ring-2 focus:ring-offset-2"
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
                <div>
                  <InputText
                    name="configuration"
                    title="Configuration"
                    editor="monaco"
                    editorLanguage="json"
                    value={configuration}
                    setValue={setConfiguration}
                    editorSize="lg"
                  />
                </div>
                <div className="flex justify-end">
                  <ButtonPrimary type="submit" disabled={isPending}>
                    {isPending ? "Loading..." : "Preview"}
                  </ButtonPrimary>
                </div>
              </div>
            </form>
          </>
        ) : (
          actionData?.previewTemplate !== undefined && (
            <>
              <div className="md:border-border md:border-b md:py-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-foreground text-lg font-medium leading-6">Preview entities</h3>
                </div>
              </div>
              <form onSubmit={handleCreate}>
                <div className="space-y-2">
                  <PreviewEntitiesTemplate template={actionData.previewTemplate} />
                  <div className="flex justify-end space-x-2">
                    <ButtonPrimary type="submit" disabled={isPending}>
                      {isPending ? (
                        <span>Creating...</span>
                      ) : actionData.previewTemplate.entities.length === 1 ? (
                        <span>Create 1 entity</span>
                      ) : (
                        <span>Create {actionData.previewTemplate.entities.length} entities</span>
                      )}
                    </ButtonPrimary>
                  </div>
                </div>
              </form>
            </>
          )
        )}
      </div>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
