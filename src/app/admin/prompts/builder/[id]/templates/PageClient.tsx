"use client";

import { useParams, useSearchParams, useRouter } from "next/navigation";
import clsx from "clsx";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TrashIcon from "@/components/ui/icons/TrashIcon";
import OrderIndexButtons from "@/components/ui/sort/OrderIndexButtons";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import { OpenAIDefaults } from "@/modules/ai/utils/OpenAIDefaults";
import { PromptTemplateDto } from "@/modules/promptBuilder/dtos/PromptTemplateDto";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import InputSelector from "@/components/ui/input/InputSelector";
import toast from "react-hot-toast";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import RowHelper from "@/lib/helpers/RowHelper";
import { RowAsJson } from "@/lib/helpers/TemplateApiHelper";
import PromptTemplateForm from "@/modules/promptBuilder/components/templates/PromptTemplateForm";
import ExclamationTriangleIcon from "@/components/ui/icons/ExclamationTriangleIcon";

type LoaderData = {
  item: PromptFlowWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  inputEntityRows: RowWithDetailsDto[];
  sampleSourceRow: RowAsJson | null;
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function PromptBuilderTemplatesPageClient({
  data,
  handleAction,
}: {
  data: LoaderData;
  handleAction: (formData: FormData) => Promise<ActionData>;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData | undefined>();
  const params = useParams();
  const router = useRouter();

  const searchParams = useSearchParams();

  const [inputEntity, setInputEntity] = useState<EntityWithDetailsDto | undefined>(undefined);

  useEffect(() => {
    const inputEntity = data.allEntities.find((f) => f.name === data.item.inputEntity?.name);
    setInputEntity(inputEntity);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.allEntities]);

  const [templates, setTemplates] = useState<PromptTemplateDto[]>(
    data.item?.templates.map((f) => {
      return {
        title: f.title,
        template: f.template,
        temperature: Number(f.temperature),
        maxTokens: Number(f.maxTokens),
        order: f.order,
      };
    }) || []
  );
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  useEffect(() => {
    if (selectedIdx === -1 && templates.length > 0) {
      setSelectedIdx(0);
    } else if (templates.length === 0) {
      setTemplates([
        ...templates,
        {
          title: "Untitled " + (templates.length + 1),
          template: "",
          temperature: OpenAIDefaults.temperature,
          order: templates.length + 1,
          maxTokens: 0,
        },
      ]);
      setSelectedIdx(templates.length);
    }
  }, [selectedIdx, templates]);

  function addTemplate() {
    setTemplates([
      ...templates,
      {
        title: "Untitled " + (templates.length + 1),
        template: "",
        temperature: OpenAIDefaults.temperature,
        order: templates.length + 1,
        maxTokens: 0,
      },
    ]);
    setSelectedIdx(templates.length);
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await handleAction(formData);
      setActionData(result);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${params.id}`, current: false },
          { name: "Variables", href: `/admin/prompts/builder/${params.id}/variables`, current: false },
          { name: "Templates", href: `/admin/prompts/builder/${params.id}/templates`, current: true },
          { name: "Outputs", href: `/admin/prompts/builder/${params.id}/outputs`, current: false },
        ]}
      />

      <div className="my-1 overflow-hidden lg:h-[calc(100vh-250px)]">
        <input type="hidden" name="action" value="save-templates" hidden readOnly />
        {templates.map((template, index) => {
          return <input type="hidden" name="templates[]" value={JSON.stringify(template)} key={index} />;
        })}
        <div className="flex flex-col space-y-2 lg:flex-row lg:space-x-2 lg:space-y-0">
          <div className="overflow-y-auto lg:w-3/12">
            <div className="overflow-y-auto">
              <ul className="divide-y divide-gray-100 overflow-y-scroll rounded-md border border-border bg-white">
                {templates
                  .sort((a, b) => a.order - b.order)
                  .map((item, idx) => (
                    <li key={idx}>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedIdx(idx);
                        }}
                        className={clsx(
                          "w-full cursor-pointer truncate rounded-sm border-2 border-dashed px-2 py-1 text-left text-sm",
                          selectedIdx === idx
                            ? "border-transparent bg-secondary/90 text-gray-900"
                            : "border-transparent text-muted-foreground hover:bg-secondary/90"
                        )}
                      >
                        <div className="group flex h-7 items-center justify-between space-x-1">
                          <div className="flex items-center space-x-2">
                            <OrderIndexButtons
                              className="hidden flex-shrink-0 2xl:block"
                              idx={idx}
                              items={templates.map((f, i) => {
                                return {
                                  idx: i,
                                  order: f.order,
                                };
                              })}
                              onChange={(newItems) => {
                                setTemplates(
                                  newItems.map((f, i) => {
                                    return { ...templates[i], order: f.order };
                                  })
                                );
                              }}
                            />
                            <div className="flex flex-col truncate">
                              <div className="truncate">{item.title}</div>
                            </div>
                          </div>

                          <div className={clsx("hidden flex-shrink-0", templates.length > 0 && "group-hover:block")}>
                            <button
                              type="button"
                              disabled={templates.length === 1}
                              onClick={(e) => {
                                e.stopPropagation();
                                setTemplates(
                                  templates
                                    .filter((f, i) => i !== idx)
                                    .map((f, idx) => {
                                      return { ...f, order: idx + 1 };
                                    })
                                );
                                setSelectedIdx(-1);
                              }}
                            >
                              <TrashIcon
                                className={clsx(
                                  "h-4 w-4 text-muted-foreground",
                                  templates.length === 1 ? "cursor-not-allowed" : "cursor-pointer hover:text-muted-foreground"
                                )}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                <li>
                  <button
                    type="button"
                    onClick={addTemplate}
                    className={clsx(
                      "w-full cursor-pointer truncate rounded-sm border-2 border-dashed px-2 py-1 text-left text-sm",
                      "border-transparent text-muted-foreground hover:bg-secondary/90"
                    )}
                  >
                    <div className="flex items-center justify-center space-x-3">
                      <div className="truncate text-center font-bold">
                        <PlusIcon className="h-4 w-4" />
                      </div>
                    </div>
                  </button>
                </li>
              </ul>
            </div>
          </div>
          <div className="lg:w-9/12">
            <div className="space-y-2">
              {inputEntity && (
                <div>
                  <div className="mb-1 flex items-center space-x-1 truncate text-xs font-medium text-muted-foreground">
                    {!data.sampleSourceRow && <ExclamationTriangleIcon className="h-4 w-4 flex-shrink-0 text-yellow-600" />}
                    <div className="truncate">
                      Select a sample <strong>{t(inputEntity.title)}</strong> row to use as sample data for the prompt.
                    </div>
                  </div>

                  <InputSelector
                    value={searchParams.get("sampleSourceRowId")?.toString()}
                    setValue={(e) => {
                      const row = data.inputEntityRows.find((f) => f.id === e);
                      if (row) {
                        const newSearchParams = new URLSearchParams(searchParams.toString());
                        newSearchParams.set("sampleSourceRowId", row.id);
                        router.push(`?${newSearchParams.toString()}`);
                      }
                    }}
                    options={data.inputEntityRows.map((item) => {
                      const entity = data.allEntities.find((e) => e.id === item.entityId)!;
                      let name = RowHelper.getTextDescription({ entity, item, includeFolio: true });
                      if (item.tenant) {
                        name = `${item.tenant.name} - ${name} (${item.id})})`;
                      }
                      return {
                        value: item.id,
                        name,
                      };
                    })}
                  />
                </div>
              )}
              <div className="overflow-y-auto lg:h-[calc(100vh-250px)]">
                <PromptTemplateForm
                  key={selectedIdx}
                  idx={selectedIdx}
                  templates={templates}
                  item={templates[selectedIdx]}
                  promptFlow={data.item}
                  onChanged={(idx, data) => {
                    templates[idx] = data;
                    setTemplates([...templates]);
                  }}
                  allEntities={data.allEntities}
                  sampleSourceRow={data.sampleSourceRow}
                  inputEntityRows={data.inputEntityRows}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-1">
        <ButtonPrimary type="submit">{t("shared.save")}</ButtonPrimary>
      </div>
    </form>
  );
}
