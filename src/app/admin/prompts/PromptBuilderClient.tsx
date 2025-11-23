"use client";

import { PromptFlowGroup } from "@prisma/client";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TableSimple from "@/components/ui/tables/TableSimple";
import DateCell from "@/components/ui/dates/DateCell";
import { PromptFlowWithExecutionsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import PromptBuilderDefault from "@/modules/promptBuilder/services/PromptBuilderDefault";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import PromptFlowUtils from "@/modules/promptBuilder/utils/PromptFlowUtils";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import DropdownWithClick from "@/components/ui/dropdowns/DropdownWithClick";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import { OpenAIDefaults } from "@/modules/ai/utils/OpenAIDefaults";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";

type LoaderData = {
  title: string;
  items: PromptFlowWithExecutionsDto[];
  allEntities: EntityWithDetailsDto[];
  groups: PromptFlowGroup[];
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function PromptBuilderClient({ data }: { data: LoaderData }) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const [submittingPrompt, setSubmittingPrompt] = useState<string | null>(null);

  async function onCreateDefault(promptTitle: string) {
    setSubmittingPrompt(promptTitle);
    try {
      const formData = new FormData();
      formData.set("action", "createDefault");
      formData.set("promptTitle", promptTitle);

      const response = await fetch("/admin/prompts/builder/api", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setActionData(result);

      if (response.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      setActionData({ error: "An error occurred" });
    } finally {
      setSubmittingPrompt(null);
    }
  }

  function missingDefaultTemplates() {
    const templates = PromptBuilderDefault.myTemplates();
    return templates.filter((template) => !data.items.some((item) => item.title === template.title));
  }

  async function onCreatePromptFlowInGroup(item: PromptFlowGroup) {
    try {
      const formData = new FormData();
      formData.set("action", "add-prompt-flow");
      formData.set("id", item.id);

      const response = await fetch("/admin/prompts/groups", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        startTransition(() => {
          router.refresh();
        });
      }
    } catch (error) {
      console.error("Error creating prompt flow in group:", error);
    }
  }

  return (
    <EditPageLayout
      title={t("prompts.builder.title")}
      buttons={
        <>
          {data.groups.length > 0 ? (
            <DropdownWithClick
              onClick={() => router.push("/admin/prompts/builder/new")}
              button={
                <div className="flex items-center space-x-2">
                  <PlusIcon className="h-3 w-3" />
                  <div>{t("shared.new")}</div>
                </div>
              }
              options={
                <div>
                  <div className="block w-full select-none bg-secondary px-4 py-2 text-left text-sm font-medium text-muted-foreground">
                    <div>Groups</div>
                  </div>
                  {data.groups.map((f) => {
                    return (
                      <button
                        key={f.id}
                        type="button"
                        className="block w-full px-4 py-2 text-left text-sm text-muted-foreground hover:bg-secondary focus:outline-none"
                        tabIndex={-1}
                        onClick={() => onCreatePromptFlowInGroup(f)}
                      >
                        <div className="flex items-center space-x-2">
                          <PlusIcon className="h-3 w-3" />
                          <div>{f.title}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              }
            />
          ) : (
            <ButtonPrimary to="new">
              <div>{t("shared.new")}</div>
              <PlusIcon className="h-5 w-5" />
            </ButtonPrimary>
          )}
        </>
      }
    >
      {missingDefaultTemplates().length > 0 && (
        <InfoBanner title="Default Prompt Flows" text="">
          <div className="flex flex-wrap space-x-1">
            {missingDefaultTemplates().map((prompt) => {
              return (
                <ButtonSecondary key={prompt.title} disabled={submittingPrompt === prompt.title} onClick={() => onCreateDefault(prompt.title)}>
                  {submittingPrompt === prompt.title ? <span>Creating...</span> : <span>{prompt.title}</span>}
                </ButtonSecondary>
              );
            })}
          </div>
        </InfoBanner>
      )}

      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute: (_, i) => `${i.id}`,
          },
        ]}
        headers={[
          {
            name: "title",
            title: "Title",
            value: (i) => (
              <div className="flex max-w-xs flex-col truncate">
                {i.promptFlowGroup && (
                  <div>
                    <SimpleBadge title={i.promptFlowGroup?.title} color={Colors.BLUE} />
                  </div>
                )}
                <Link href={i.id} className="truncate text-base font-bold hover:underline">
                  {i.title}
                </Link>
              </div>
            ),
          },
          {
            name: "config",
            title: "Config",
            value: (i) => (
              <div className="flex flex-col">
                <div>{OpenAIDefaults.getModelName(i.model)}</div>
                <div className="text-xs font-medium text-muted-foreground">{OpenAIDefaults.getModelProvider(i.model)}</div>
              </div>
            ),
          },
          {
            name: "inputEntity",
            title: "Input Entity",
            value: (i) => (
              <div>
                {i.inputEntity ? (
                  <div className="flex flex-col">
                    <div>{t(i.inputEntity.title)}</div>
                    <div className="text-xs font-medium text-muted-foreground">{i.inputEntity.name}</div>
                  </div>
                ) : (
                  <div>-</div>
                )}
              </div>
            ),
          },
          {
            name: "action",
            title: "Action",
            value: (i) => <div>{i.actionTitle}</div>,
          },
          {
            name: "templates",
            title: "Templates",
            value: (i) => (
              <ShowPayloadModalButton
                withCopy={false}
                title={`${i.templates.length} templates`}
                description={`${i.templates.length} templates`}
                payload={JSON.stringify(i.templates)}
              />
            ),
            className: "w-full",
          },
          {
            name: "variables",
            title: "Variables",
            value: (i) => (
              <div className="flex flex-col">
                <ShowPayloadModalButton
                  withCopy={false}
                  title={`${PromptFlowUtils.getVariablesNeeded(i, data.allEntities).length} variables`}
                  description={`${PromptFlowUtils.getVariablesNeeded(i, data.allEntities).length} variables`}
                  payload={JSON.stringify(PromptFlowUtils.getVariablesNeeded(i, data.allEntities).map((f) => f.name))}
                />
              </div>
            ),
            className: "w-full",
          },
          {
            name: "outputs",
            title: "Outputs",
            value: (i) => (
              <div className="flex flex-col">
                <ShowPayloadModalButton
                  withCopy={false}
                  title={`${i.outputs.length} outputs`}
                  description={`${i.outputs.length} outputs`}
                  payload={JSON.stringify(
                    i.outputs.map((f) => ({
                      type: f.type,
                      entity: {
                        name: f.entity.name,
                        title: t(f.entity.title),
                      },
                      mappings: f.mappings.map((m) => ({
                        promptTemplate: m.promptTemplate.title,
                        property: {
                          name: m.property.name,
                          title: t(m.property.title),
                        },
                      })),
                    }))
                  )}
                />
              </div>
            ),
            className: "w-full",
          },
          {
            name: "executions",
            title: "Executions",
            value: (i) => (
              <Link href={`/admin/prompts/executions/${i.id}`} className="flex flex-col underline">
                <div>
                  {i.executions.length} {i.executions.length === 1 ? "execution" : "executions"}
                </div>
              </Link>
            ),
          },
          {
            name: "results",
            title: "Results",
            value: (i) => (
              <Link href={`/admin/prompts/results/${i.id}`} className="flex flex-col underline">
                <div>
                  {i.executions.reduce((a, b) => a + b.results.length, 0)} {i.executions.reduce((a, b) => a + b.results.length, 0) === 1 ? "result" : "results"}
                </div>
              </Link>
            ),
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (i) => <DateCell date={i.createdAt} />,
            className: "hidden xl:table-cell",
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">{t("prompts.builder.empty.title")}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t("prompts.builder.empty.description")}</p>
          </div>
        }
      />

      <ActionResultModal actionData={actionData} showSuccess={false} />
    </EditPageLayout>
  );
}
