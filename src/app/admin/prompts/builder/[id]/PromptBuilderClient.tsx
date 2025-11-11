"use client";

import { PromptFlowGroup } from "@prisma/client";
import { useRef, useState, useTransition } from "react";
import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import TabsWithIcons from "@/components/ui/tabs/TabsWithIcons";
import PromptFlowForm from "@/modules/promptBuilder/components/PromptFlowForm";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { useEffect } from "react";

type LoaderData = {
  item: PromptFlowWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  promptFlowGroups: PromptFlowGroup[];
};

type ActionData = {
  error?: string;
  success?: string;
};

export default function PromptBuilderClient({ 
  data,
  handleAction 
}: { 
  data: LoaderData; 
  handleAction: (formData: FormData) => Promise<ActionData>;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [actionData, setActionData] = useState<ActionData | undefined>();

  const confirmDelete = useRef<RefConfirmModal>(null);

  useEffect(() => {
    if (actionData?.error) {
      toast.error(actionData.error);
    } else if (actionData?.success) {
      toast.success(actionData.success);
    }
  }, [actionData]);

  function onDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  
  function onDeleteConfirmed() {
    const form = new FormData();
    form.set("action", "delete");
    startTransition(async () => {
      const result = await handleAction(form);
      setActionData(result);
    });
  }
  
  function onDuplicate() {
    const form = new FormData();
    form.set("action", "duplicate");
    startTransition(async () => {
      const result = await handleAction(form);
      setActionData(result);
    });
  }
  
  return (
    <div className="space-y-2">
      <TabsWithIcons
        tabs={[
          { name: "Settings", href: `/admin/prompts/builder/${data.item.id}`, current: true },
          { name: "Variables", href: `/admin/prompts/builder/${data.item.id}/variables`, current: false },
          { name: "Templates", href: `/admin/prompts/builder/${data.item.id}/templates`, current: false },
          { name: "Outputs", href: `/admin/prompts/builder/${data.item.id}/outputs`, current: false },
        ]}
      />

      <div className="mx-auto max-w-lg">
        <PromptFlowForm
          key={data.item.id}
          promptFlowGroups={data.promptFlowGroups}
          item={data.item}
          onDelete={onDelete}
          allEntities={data.allEntities}
          onDuplicate={onDuplicate}
        />
      </div>

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} />
    </div>
  );
}
