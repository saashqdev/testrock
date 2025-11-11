"use client";

import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useEffect, useRef, useState, useTransition } from "react";
import toast from "react-hot-toast";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import PencilIcon from "@/components/ui/icons/PencilIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TrashIcon from "@/components/ui/icons/TrashIcon";
import XIcon from "@/components/ui/icons/XIcon";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "@/components/ui/tables/TableSimple";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import { PromptFlowInputVariableWithDetailsDto } from "@/db/models/promptFlows/PromptFlowInputVariablesModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { PromptFlowVariableTypes } from "@/modules/promptBuilder/dtos/PromptFlowVariableType";
import { ReactNode } from "react";
import { deleteVariableAction } from "./actions";

type PageProps = {
  item: PromptFlowWithDetailsDto;
  items: PromptFlowInputVariableWithDetailsDto[];
  children?: ReactNode;
};

export default function VariablesPage({ item, items, children }: PageProps) {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [actionResult, setActionResult] = useState<{ error?: string; success?: string } | null>(null);

  const confirmDelete = useRef<RefConfirmModal>(null);

  // Check if we're on a modal route (new or edit)
  const isOnModalRoute = pathname?.includes('/variables/new') || 
                         (pathname?.includes('/variables/') && 
                          pathname?.split('/variables/')[1]?.length > 0 &&
                          !pathname?.endsWith('/variables'));
  const isModalOpen = isOnModalRoute && !!children;

  useEffect(() => {
    if (actionResult?.error) {
      toast.error(actionResult.error);
    } else if (actionResult?.success) {
      toast.success(actionResult.success);
    }
  }, [actionResult]);

  function onDelete(item: PromptFlowInputVariableWithDetailsDto) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show("Delete variable?", "Delete", "Cancel", `Are you sure you want to delete this variable?`);
  }

  function onConfirmedDelete(item: PromptFlowInputVariableWithDetailsDto) {
    startTransition(async () => {
      const result = await deleteVariableAction(item.id);
      setActionResult(result);
      if (result.success) {
        router.refresh();
      }
    });
  }

  function closeModal() {
    // Navigate back to the variables page without the modal route
    router.push(`/admin/prompts/builder/${params.id}/variables`);
  }

  // Determine modal title based on route
  const modalTitle = pathname?.includes('/new') ? "Add variable" : "Edit variable";

  return (
    <div className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${params.id}`, current: false },
          { name: "Variables", href: `/admin/prompts/builder/${params.id}/variables`, current: true },
          { name: "Templates", href: `/admin/prompts/builder/${params.id}/templates`, current: false },
          { name: "Outputs", href: `/admin/prompts/builder/${params.id}/outputs`, current: false },
        ]}
      />

      <div className="space-y-2">
        <TableSimple
          items={items}
          headers={[
            {
              name: "type",
              title: "Type",
              value: (i) => <div>{PromptFlowVariableTypes.find((f) => f.value === i.type)?.name ?? i.type}</div>,
            },
            {
              name: "title",
              title: "Title",
              className: "w-full",
              value: (i) => (
                <div className="flex flex-col">
                  <div>{i.title}</div>
                  <div className="text-muted-foreground text-sm">{i.name}</div>
                </div>
              ),
            },
            {
              name: "isRequired",
              title: "Required",
              value: (i) => <div>{i.isRequired ? <CheckIcon className="h-5 w-5 text-green-500" /> : <XIcon className="text-muted-foreground h-5 w-5" />}</div>,
            },
            {
              name: "actions",
              title: "",
              value: (i) => (
                <div className="flex items-center space-x-1 truncate p-1">
                  <DeleteButton onDelete={() => onDelete(i)} canDelete={true} />
                  <Link
                    href={i.id}
                    className="hover:bg-secondary/90 focus:bg-secondary/90 group flex items-center rounded-md border border-transparent p-2 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                  >
                    <PencilIcon className="group-hover:text-muted-foreground h-4 w-4 text-gray-300" />
                  </Link>
                </div>
              ),
            },
          ]}
        />
        <Link
          href={`new`}
          className="focus:ring-theme-500 border-border hover:border-border relative block w-full rounded-lg border-2 border-dashed px-12 py-6 text-center focus:outline-none focus:ring-2 focus:ring-offset-2"
        >
          <PlusIcon className="mx-auto h-5 text-gray-900" />
          <span className="mt-2 block text-sm font-medium text-gray-900">Add new variable</span>
        </Link>
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onConfirmedDelete} destructive />

      <SlideOverWideEmpty
        title={modalTitle}
        open={isModalOpen}
        onClose={closeModal}
        className="sm:max-w-sm"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{children}</div>
        </div>
      </SlideOverWideEmpty>
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
