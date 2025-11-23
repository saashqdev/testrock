"use client";

import { useEffect, useState, useTransition } from "react";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import StarsIconFilled from "@/components/ui/icons/StarsIconFilled";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import RunPromptFlowForm from "./RunPromptFlowForm";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import { Menu } from "@headlessui/react";
import clsx from "clsx";
import PromptFlowUtils from "../../utils/PromptFlowUtils";
import { RowDto } from "@/modules/rows/repositories/RowDto";

interface Props {
  idx?: string | number;
  type: "list" | "edit";
  promptFlows: PromptFlowWithDetailsDto[];
  row?: RowDto;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  openSideModal?: boolean;
}
export default function RunPromptFlowButtons({ idx, type, promptFlows, row, disabled, className, children, openSideModal }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [currentFormData, setCurrentFormData] = useState<FormData | null>(null);

  const [items, setItems] = useState<PromptFlowWithDetailsDto[]>([]);
  const [isSettingPromptFlowVariables, setIsSettingPromptFlowVariables] = useState<PromptFlowWithDetailsDto | null>(null);

  useEffect(() => {
    setItems(PromptFlowUtils.getPromptFlowsOfType({ type, promptFlows, row }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type, promptFlows]);

  async function submitForm(formData: FormData) {
    setCurrentFormData(formData);
    startTransition(async () => {
      try {
        // Convert FormData to a regular object for API call
        const data: Record<string, string> = {};
        formData.forEach((value, key) => {
          data[key] = value.toString();
        });

        // Make API call to submit the form
        const response = await fetch("/api/prompt-flows/run", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (response.ok) {
          // Optionally refresh the page or handle success
          router.refresh();
        } else {
          console.error("Failed to submit form:", response.statusText);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setCurrentFormData(null);
      }
    });
  }

  function onRun(item: PromptFlowWithDetailsDto) {
    if (item.inputVariables.length > 0 || openSideModal) {
      setIsSettingPromptFlowVariables(item);
    } else {
      const form = new FormData();
      form.set("action", "run-prompt-flow");
      if (idx !== undefined) {
        form.set("idx", idx.toString());
      }
      form.set("promptFlowId", item.id);
      if (row) {
        form.set("rowId", row.id.toString());
      }
      submitForm(form);
    }
  }

  function isLoading(f: PromptFlowWithDetailsDto) {
    return (
      isPending &&
      currentFormData?.get("promptFlowId") === f.id &&
      (!idx || currentFormData?.get("idx") === idx.toString()) &&
      currentFormData?.get("rowId") === row?.id.toString()
    );
  }
  return (
    <div>
      {items.length === 0 ? null : items.length > 1 ? (
        <Dropdown
          right={false}
          disabled={disabled}
          isLoading={isPending && currentFormData?.get("action") === "run-prompt-flow"}
          button={
            <div className={clsx(className)}>
              <StarsIconFilled className="h-4 w-4 text-theme-500" />
            </div>
          }
          options={
            <div>
              {items.map((item) => {
                return (
                  <Menu.Item key={item.id}>
                    {({ active }) => (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRun(item);
                        }}
                        className={clsx("w-full text-left", active ? "bg-secondary/90 text-gray-900" : "text-muted-foreground", "block px-4 py-2 text-sm")}
                      >
                        {item.actionTitle}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          }
        ></Dropdown>
      ) : (
        items.map((item) => {
          return (
            <ButtonSecondary
              key={item.id}
              disabled={disabled || isLoading(item)}
              className={className}
              // isLoading={isLoading(item)}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                onRun(item);
              }}
            >
              {children ?? (
                <div className={clsx(className)}>
                  {type === "edit" ? <div className="text-xs">{item.actionTitle}</div> : <StarsIconFilled className="h-3 w-3 text-theme-500" />}
                </div>
              )}
            </ButtonSecondary>
          );
        })
      )}

      <div className="z-50">
        <SlideOverWideEmpty
          size="2xl"
          title={isSettingPromptFlowVariables?.actionTitle ?? "Run prompt flow"}
          open={!!isSettingPromptFlowVariables}
          onClose={() => setIsSettingPromptFlowVariables(null)}
        >
          {isSettingPromptFlowVariables && <RunPromptFlowForm item={isSettingPromptFlowVariables} rowId={row?.id} />}
        </SlideOverWideEmpty>
      </div>
    </div>
  );
}
