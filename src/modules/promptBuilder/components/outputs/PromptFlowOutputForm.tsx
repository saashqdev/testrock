"use client";

import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import { PromptFlowOutputWithDetailsDto } from "@/db/models/promptFlows/PromptFlowOutputsModel";
import { PromptFlowOutputType, PromptFlowOutputTypes } from "../../dtos/PromptFlowOutputType";
import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import InputSelector from "@/components/ui/input/InputSelector";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import { useTranslation } from "react-i18next";
import InfoBanner from "@/components/ui/banners/InfoBanner";

export default function PromptFlowOutputForm({
  allEntities,
  promptFlow,
  item,
  onDelete,
}: {
  allEntities: EntityWithDetailsDto[];
  promptFlow: PromptFlowWithDetailsDto;
  item: PromptFlowOutputWithDetailsDto | undefined;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const { pending } = useFormStatus();

  const [type, setType] = useState<PromptFlowOutputType>((item?.type as PromptFlowOutputType) ?? "");
  const [entityId, setEntityId] = useState<string | null>(item?.entityId ?? null);
  const [inputEntity] = useState(allEntities.find((f) => f.id === promptFlow.inputEntityId));

  const [entities, setEntities] = useState<{ id: string; name: string; title: string }[]>(allEntities);

  useEffect(() => {
    if (type === "updateCurrentRow") {
      setEntities(inputEntity ? [inputEntity] : []);
      setEntityId(inputEntity?.id || null);
    }
    if (type === "createRow") {
      setEntities(allEntities);
      setEntityId(null);
    }
    if (type === "createParentRow") {
      setEntities(
        inputEntity?.parentEntities.map((f) => {
          return {
            id: f.parentId,
            name: f.parent.name,
            title: f.parent.title,
          };
        }) || []
      );
      setEntityId(null);
    }
    if (type === "createChildRow") {
      setEntities(
        inputEntity?.childEntities.map((f) => {
          return {
            id: f.childId,
            name: f.child.name,
            title: f.child.title,
          };
        }) || []
      );
      setEntityId(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]);

  function isOutputTypeDisabled(item: PromptFlowOutputType) {
    switch (item) {
      case "updateCurrentRow":
        return !inputEntity;
      case "createParentRow":
        return !inputEntity || inputEntity.parentEntities.length === 0;
      case "createChildRow":
        return !inputEntity || inputEntity.childEntities.length === 0;
      case "createRow":
        return false;
      default:
        return false;
    }
  }

  return (
    <form method="post">
      <input type="hidden" name="action" value={item ? "edit" : "new"} />
      <div>
        <div className="mt-4 space-y-2">
          {inputEntity && (
            <InfoBanner title="Input Entity">
              {t(inputEntity?.title)} ({inputEntity.name})
            </InfoBanner>
          )}
          <InputSelector
            withSearch={false}
            name="type"
            title="Output Type"
            value={type}
            setValue={(e) => setType(e as PromptFlowOutputType)}
            options={PromptFlowOutputTypes.map((f) => {
              let name: string = f.name;
              if (f.value === "updateCurrentRow" && promptFlow.inputEntity) {
                name = `${f.name} (${t(promptFlow.inputEntity.title)})`;
              }
              return {
                name,
                value: f.value,
                disabled: isOutputTypeDisabled(f.value),
              };
            })}
            required
          />

          <InputSelector
            withSearch={false}
            name="entityId"
            title="Entity"
            value={entityId ?? undefined}
            setValue={(e) => setEntityId(e?.toString() ?? null)}
            options={entities.map((f) => {
              return { name: f.title, value: f.id };
            })}
            required
          />
        </div>

        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {onDelete && (
              <ButtonSecondary disabled={pending} type="button" className="w-full" onClick={onDelete} destructive>
                <div>{"Delete"}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <LoadingButton actionName={item ? "edit" : "new"} type="submit" disabled={pending}>
              {t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </div>
    </form>
  );
}
