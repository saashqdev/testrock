"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect, useState } from "react";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { WorkflowsTemplateDto } from "@/modules/workflowEngine/dtos/WorkflowsTemplateDto";
import DefaultWorkflowTemplates from "@/modules/workflowEngine/utils/DefaultWorkflowTemplates";
import UrlUtils from "@/utils/app/UrlUtils";
import InputSearch from "@/components/ui/input/InputSearch";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import WorkflowUtils from "../../../helpers/WorkflowUtils";
import EmptyState from "@/components/ui/emptyState/EmptyState";

export default function WorkflowsTemplatesView() {
  const router = useRouter();
  const params = useParams();

  const allTemplates = DefaultWorkflowTemplates.filter((f) => !f.adminOnly || !params.tenant);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"json" | "templates">("templates");
  const [searchInput, setSearchInput] = useState<string>("");
  const [configuration, setConfiguration] = useState<string>(allTemplates.length > 0 ? JSON.stringify(allTemplates[0], null, "\t") : "{}");
  const [filteredItems, setFilteredItems] = useState<WorkflowsTemplateDto[]>(allTemplates);

  const handleSubmit = async (formData: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/workflow-engine/templates", {
        method: "POST",
        body: formData,
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Invalid response format. Please refresh the page and try again.");
      }

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Something went wrong");
      }

      if (result.success) {
        setSuccess(result.success);
      }

      // Handle redirect if provided in response
      if (result.redirectUrl) {
        router.push(result.redirectUrl);
      } else if (response.redirected) {
        router.push(response.url);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let items = allTemplates;
    if (searchInput) {
      items = allTemplates.filter((item) => {
        return (
          item.title.toLowerCase().includes(searchInput.toLowerCase()) ||
          getBlockTypesUsed(item.workflows)
            .map((f) => `[${f.value}] ${f.name}`)
            .join(", ")
            .toLowerCase()
            .includes(searchInput.toLowerCase())
        );
      });
    }
    setFilteredItems(items);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  function getBlockTypesUsed(workflows: WorkflowsTemplateDto["workflows"]) {
    const types = workflows.flatMap((workflow) => workflow.blocks.map((block) => block.type));
    const uniqueTypes = [...new Set(types)];
    let blockTypes: { name: string; value: string }[] = [];
    uniqueTypes.forEach((type) => {
      blockTypes.push({
        name: WorkflowUtils.getBlockTypeName({ type }),
        value: type,
      });
    });
    return blockTypes;
  }
  return (
    <EditPageLayout
      title="Workflow Templates"
      buttons={
        <>
          {mode === "templates" && <InputSearch className="w-64" value={searchInput} onChange={setSearchInput} />}
          <ButtonSecondary onClick={() => setMode(mode === "json" ? "templates" : "json")}>
            {mode === "json" ? "Browse Templates" : "Import from JSON"}
          </ButtonSecondary>
        </>
      }
    >
      <div className="md:border-t md:border-border md:py-2">
        {error ? (
          <div className="space-y-1">
            <p id="form-error-message" className="py-2 text-sm text-rose-500" role="alert">
              {error}
            </p>
            <button type="button" className="text-sm font-medium text-muted-foreground underline hover:text-muted-foreground" onClick={() => setError(null)}>
              Try again
            </button>
          </div>
        ) : success ? (
          <>
            <div id="form-success-message" className="space-y-1 py-2 text-sm text-foreground">
              {success}
            </div>
            <Link
              href={UrlUtils.getModulePath(params, `workflow-engine/workflows`)}
              className="text-sm font-medium text-theme-600 underline hover:text-theme-500"
            >
              View all workflows
            </Link>
          </>
        ) : (
          <div>
            {mode === "templates" && (
              <div className="space-y-3">
                {filteredItems.length === 0 && (
                  <div>
                    <EmptyState
                      className="bg-background"
                      captions={{
                        thereAreNo: "There are no workflows",
                      }}
                    />
                  </div>
                )}
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-3 2xl:grid-cols-4">
                  {filteredItems.map((item) => {
                    return (
                      <button
                        type="button"
                        key={item.title}
                        className="shadow-2xs focus:outline-hidden flex w-full flex-col items-start overflow-hidden rounded-md border border-border bg-background text-left hover:cursor-pointer hover:border-theme-300 hover:bg-theme-50 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        onClick={() => {
                          const form = new FormData();
                          form.set("action", "preview");
                          form.set("configuration", JSON.stringify(item, null, "\t"));
                          handleSubmit(form);
                        }}
                      >
                        <div className="flex flex-col items-start space-y-2 px-3 py-3">
                          <div className="font-medium text-foreground">{item.title}</div>
                          <div className="space-y-0.5">
                            <div className="block text-xs font-medium uppercase text-muted-foreground">Workflows ({item.workflows.length})</div>
                            <ul className="text-sm text-muted-foreground">
                              {item.workflows.map((f) => {
                                return <li key={f.name}>{f.name}</li>;
                              })}
                            </ul>
                          </div>
                          <div className="space-y-0.5">
                            <div className="block text-xs font-medium uppercase text-muted-foreground">Block Types</div>
                            <div className="text-sm text-muted-foreground">
                              {getBlockTypesUsed(item.workflows)
                                .map((f) => f.name)
                                .join(", ")}
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {mode === "json" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  handleSubmit(formData);
                }}
              >
                <input type="hidden" name="action" value="preview" hidden readOnly />
                <div className="space-y-3">
                  <div className="flex space-x-2">
                    <div className="flex space-x-2">
                      {allTemplates.map((t) => (
                        <button
                          key={t.title}
                          type="button"
                          onClick={() => setConfiguration(JSON.stringify(t, null, "\t"))}
                          className="focus:outline-hidden inline-flex items-center rounded border border-transparent bg-theme-100 px-2.5 py-1.5 text-xs font-medium text-theme-700 hover:bg-theme-200 focus:ring-2 focus:ring-ring focus:ring-offset-2"
                        >
                          {t.title}
                        </button>
                      ))}
                    </div>
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
                    <LoadingButton type="submit" disabled={isLoading}>
                      {isLoading ? "Importing..." : "Import"}
                    </LoadingButton>
                  </div>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </EditPageLayout>
  );
}
