"use client";

import { PromptFlowOutputMappingsModel } from "@/db/models";
import { PromptTemplate } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import PencilIcon from "@/components/ui/icons/PencilIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TrashIcon from "@/components/ui/icons/TrashIcon";
import FolderIconFilled from "@/components/ui/icons/entities/FolderIconFilled";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import PromptFlowOutputUtils from "@/modules/promptBuilder/utils/PromptFlowOutputUtils";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

type PageClientProps = {
  initialData: {
    item: PromptFlowWithDetailsDto;
    items: PromptFlowOutputWithDetailsDto[];
    allEntities: EntityWithDetailsDto[];
  };
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function PageClient({ initialData }: PageClientProps) {
  const { t } = useTranslation();
  const [data, setData] = useState(initialData);
  const [actionData, setActionData] = useState<ActionData | null>(null);
  const params = useParams();
  const [outlet, setOutlet] = useState<React.ReactNode>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const confirmDeleteOutput = useRef<RefConfirmModal>(null);
  const confirmDeleteOutputMapping = useRef<RefConfirmModal>(null);

  const [toggledItems, setToggledItems] = useState<string[]>([]);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  function onDeleteOutput(item: PromptFlowOutputWithDetailsDto) {
    confirmDeleteOutput.current?.setValue(item);
    confirmDeleteOutput.current?.show("Delete output?", "Delete", "Cancel", `Are you sure you want to delete this output?`);
  }

  function onConfirmedDeleteOutput(item: PromptFlowOutputWithDetailsDto) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/prompts/builder/${params.id}/outputs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete-output", id: item.id }),
        });
        const result = await response.json();
        setActionData(result);
        if (response.ok && result.success) {
          // Reload data
          const dataResponse = await fetch(`/api/admin/prompts/builder/${params.id}/outputs`);
          if (dataResponse.ok) {
            setData(await dataResponse.json());
          }
        }
      } catch (error) {
        setActionData({ error: "Failed to delete output" });
      }
    });
  }

  function onDeleteMapping(item: PromptFlowOutputMappingsModel) {
    confirmDeleteOutputMapping.current?.setValue(item);
    confirmDeleteOutputMapping.current?.show("Delete output mapping?", "Delete", "Cancel", `Are you sure you want to delete this output mapping?`);
  }

  function onConfirmedDeleteMapping(item: PromptFlowOutputMappingsModel) {
    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/prompts/builder/${params.id}/outputs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "delete-output-mapping", id: item.id }),
        });
        const result = await response.json();
        setActionData(result);
        if (response.ok && result.success) {
          // Reload data
          const dataResponse = await fetch(`/api/admin/prompts/builder/${params.id}/outputs`);
          if (dataResponse.ok) {
            setData(await dataResponse.json());
          }
        }
      } catch (error) {
        setActionData({ error: "Failed to delete mapping" });
      }
    });
  }

  function getOutletTitle() {
    if (typeof window !== "undefined" && location.pathname.includes("/mappings/")) {
      if (params.mapping) {
        return "Edit mapping";
      } else {
        return "Create mapping";
      }
    } else {
      if (params.output) {
        return "Edit output";
      } else {
        return "Create output";
      }
    }
  }

  return (
    <div className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${params.id}`, current: false },
          { name: "Variables", href: `/admin/prompts/builder/${params.id}/variables`, current: false },
          { name: "Templates", href: `/admin/prompts/builder/${params.id}/templates`, current: false },
          { name: "Outputs", href: `/admin/prompts/builder/${params.id}/outputs`, current: true },
        ]}
      />

      <div className="space-y-2">
        {data.items.map((item, idx) => {
          return (
            <div key={idx} className="space-y-2">
              <div className="border-border rounded-md border bg-white px-4 py-0.5 shadow-sm">
                <div className="space-y-2">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className=" flex items-center space-x-3 truncate">
                        <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                          <div className="flex items-baseline space-x-1 truncate">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-2">
                                <div>
                                  <span className="font-medium">{PromptFlowOutputUtils.getOutputTitle(item)}</span>: {t(item.entity.title)}
                                  {item.mappings.length > 0 && (
                                    <span className="ml-1 truncate text-xs">
                                      ({item.mappings.length === 1 ? "1 mapping" : `${item.mappings.length} mappings`})
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <DeleteButton onDelete={() => onDeleteOutput(item)} canDelete={true} />
                        <button
                          type="button"
                          onClick={() => {
                            setToggledItems((prev) => {
                              if (prev.includes(item.id)) {
                                return prev.filter((f) => f !== item.id);
                              }
                              return [...prev, item.id];
                            });
                          }}
                          className="hover:bg-secondary/90 focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <FolderIconFilled className="hover:text-muted-foreground h-4 w-4 text-gray-300" />
                        </button>
                        <Link
                          href={item.id}
                          className="hover:bg-secondary/90 focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PencilIcon className="group-hover:text-muted-foreground h-4 w-4 text-gray-300" />
                        </Link>
                        <Link
                          href={`${item.id}/mappings/new`}
                          className="hover:bg-secondary/90 focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <PlusIcon className="hover:text-muted-foreground h-4 w-4 text-gray-300" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
                {!toggledItems.includes(item.id) && <PromptFlowOutputMappings promptFlowOutput={item} onDeleteMapping={onDeleteMapping} />}
              </div>
            </div>
          );
        })}
        <Link
          href={`new`}
          className="focus:ring-theme-500 border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed px-12 py-6 text-center focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-5 text-gray-900" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Add new output</span>
        </Link>
      </div>

      <ConfirmModal ref={confirmDeleteOutput} onYes={onConfirmedDeleteOutput} destructive />
      <ConfirmModal ref={confirmDeleteOutputMapping} onYes={onConfirmedDeleteMapping} destructive />

      <SlideOverWideEmpty
        title={getOutletTitle()}
        open={!!outlet}
        onClose={() => {
          router.replace(".");
        }}
        size="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{outlet}</div>
        </div>
      </SlideOverWideEmpty>
    </div>
  );
}

function PromptFlowOutputMappings({
  promptFlowOutput,
  onDeleteMapping,
}: {
  promptFlowOutput: PromptFlowOutputWithDetailsDto;
  onDeleteMapping: (item: PromptFlowOutputMappingsModel) => void;
}) {
  return (
    <div className="space-y-2 pb-2">
      <div className="border-border w-full space-y-2 rounded-md border bg-slate-50 px-2 py-2">
        <div className="text-muted-foreground text-sm font-medium">Mappings</div>
        <div className="space-y-2">
          <MappingsList output={promptFlowOutput} items={promptFlowOutput.mappings} onDeleteMapping={onDeleteMapping} />
          <Link
            href={`${promptFlowOutput.id}/mappings/new`}
            className="focus:ring-theme-500 hover:border-border border-border relative block w-full rounded-lg border-2 border-dashed px-12 py-4 text-center focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            <span className="text-muted-foreground block text-xs font-medium">Add mapping</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

function MappingsList({
  output,
  items,
  onDeleteMapping,
}: {
  output: PromptFlowOutputWithDetailsDto;
  items: (PromptFlowOutputMappingsModel & {
    promptTemplate: PromptTemplate;
    property: { id: string; name: string; title: string };
  })[];
  onDeleteMapping: (item: PromptFlowOutputMappingsModel) => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="space-y-2">
      {items.map((item) => {
        return (
          <div key={item.id} className="border-border rounded-md border bg-white px-4 py-0.5 shadow-sm">
            <div className="space-y-2">
              <div className="flex items-center justify-between space-x-2">
                <div className="flex items-center space-x-2 truncate">
                  <div className=" flex items-center space-x-3 truncate">
                    <div className="flex items-center space-x-2 truncate text-sm text-gray-800">
                      <div className="flex items-baseline space-x-1 truncate">
                        <div className="flex flex-col">
                          <div className="flex items-center space-x-2">
                            <div className="flex flex-col">
                              <div className="flex items-baseline space-x-1 text-sm text-gray-800">
                                {item.promptTemplate.title} &rarr; <span className="ml-1 font-medium">{t(item.property.title)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-shrink-0 space-x-1">
                  <div className="flex items-center space-x-1 truncate p-1">
                    <Link
                      href={`${output.id}/mappings/${item.id}`}
                      className="hover:bg-secondary/90 focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                    >
                      <PencilIcon className="group-hover:text-muted-foreground h-4 w-4 text-gray-300" />
                    </Link>
                    <button
                      type="button"
                      className="hover:bg-secondary/90 focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                      onClick={() => onDeleteMapping(item)}
                    >
                      <TrashIcon className="group-hover:text-muted-foreground h-4 w-4 text-gray-300" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function DeleteButton({ onDelete, canDelete }: { onDelete: () => void; canDelete: boolean }) {
  return (
    <button
      type="button"
      className={clsx(
        "focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1",
        !canDelete ? "cursor-not-allowed opacity-50" : "hover:bg-secondary/90"
      )}
      disabled={!canDelete}
      onClick={onDelete}
    >
      <TrashIcon className={clsx("h-4 w-4 text-gray-300", canDelete && "group-hover:text-muted-foreground")} />
    </button>
  );
}
