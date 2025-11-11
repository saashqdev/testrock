"use client";

import { useTranslation } from "react-i18next";
import { useTransition } from "react";
import { toast } from "sonner";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TableSimple from "@/components/ui/tables/TableSimple";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { PromptFlowGroupWithDetailsDto } from "@/db/models/promptFlows/PromptFlowGroupsModel";

interface GroupsClientProps {
  items: PromptFlowGroupWithDetailsDto[];
  addPromptFlowAction: (formData: FormData) => Promise<void>;
  children?: React.ReactNode;
}

export function GroupsClient({ items, addPromptFlowAction, children }: GroupsClientProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  function onCreatePromptFlow(item: PromptFlowGroupWithDetailsDto) {
    const formData = new FormData();
    formData.set("action", "add-prompt-flow");
    formData.set("id", item.id);
    
    startTransition(async () => {
      try {
        await addPromptFlowAction(formData);
        toast.success(t("shared.success"));
      } catch (error) {
        toast.error(error instanceof Error ? error.message : t("shared.error"));
      }
    });
  }

  return (
    <EditPageLayout
      title={"Groups"}
      buttons={
        <>
          <ButtonSecondary to="new">
            <PlusIcon className="h-3 w-3" />
            <div>{t("shared.new")}</div>
          </ButtonSecondary>
        </>
      }
    >
      <TableSimple
        items={items}
        actions={[
          {
            title: "Add Variant",
            onClick: (idx, item) => onCreatePromptFlow(item),
          },
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
                <div className="truncate text-base font-bold">{i.title}</div>
                <div className="text-muted-foreground truncate text-sm">{i.description}</div>
              </div>
            ),
          },
          {
            name: "templates",
            title: "Templates",
            value: (i) => (
              <div className="flex flex-col">
                {i.templates.map((t, idx) => (
                  <div key={idx} className="text-muted-foreground text-sm">
                    #{t.order} - {t.title}
                  </div>
                ))}
              </div>
            ),
            className: "w-full",
          },
          {
            name: "promptFlows",
            title: "Prompt Flows",
            value: (i) => (
              <div className="flex flex-col">
                {i.promptFlows.length === 0 && <div className="text-muted-foreground text-sm">No prompt flows</div>}
                {i.promptFlows.map((t, idx) => (
                  <div key={idx} className="text-muted-foreground text-sm">
                    {t.title}
                  </div>
                ))}
              </div>
            ),
          },
        ]}
        noRecords={
          <div className="p-12 text-center">
            <h3 className="mt-1 text-sm font-medium text-gray-900">No groups</h3>
            <p className="text-muted-foreground mt-1 text-sm">Group prompt flows that share the same template structure.</p>
          </div>
        }
      />

      {children}
    </EditPageLayout>
  );
}
