import CodeGeneratorHelper from "@/modules/codeGenerator/utils/CodeGeneratorHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import CodeGeneratorPropertiesHelper from "../../utils/CodeGeneratorPropertiesHelper";

function generate({ entity }: { entity: EntityWithDetailsDto }): string {
  const { capitalized } = CodeGeneratorHelper.getNames(entity);
  const imports: string[] = [];
  imports.push(`import { useTransition } from "react";
import { useTranslation } from "react-i18next";
import { useRef } from "react";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputGroup from "@/components/ui/forms/InputGroup";
import ActionResultModal from "@/components/ui/modals/ActionResultModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";`);
  imports.push(`import { ${capitalized}Dto } from "../dtos/${capitalized}Dto";`);

  let template = `
export default function ${capitalized}Form({
  item,
  actionData,
  isUpdating,
  isCreating,
  canUpdate,
  canDelete,
  onCancel,
  onSubmit,
  onDelete: onDeleteAction,
}: {
  item?: ${capitalized}Dto;
  actionData: { success?: string; error?: string } | undefined;
  isUpdating?: boolean;
  isCreating?: boolean;
  canUpdate?: boolean;
  canDelete?: boolean;
  onCancel?: () => void;
  onSubmit?: (formData: FormData) => void;
  onDelete?: () => void;
}) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const confirmDelete = useRef<RefConfirmModal>(null);

  function handleDelete() {
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }
  function onDeleteConfirmed() {
    if (onDeleteAction) {
      startTransition(() => {
        onDeleteAction();
      });
    }
  }
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (onSubmit) {
      const formData = new FormData(e.currentTarget);
      startTransition(() => {
        onSubmit(formData);
      });
    }
  }
  function isDisabled() {
    if (isUpdating && !canUpdate) {
      return true;
    }
    if (!isUpdating && !isCreating) {
      return true;
    }
  }
  return (
    <form key={!isDisabled() ? "enabled" : "disabled"} onSubmit={handleSubmit} className="space-y-4">
      {item ? <input name="action" value="edit" hidden readOnly /> : <input name="action" value="create" hidden readOnly />}

      <InputGroup title={t("shared.details")}>
        <div className="space-y-2">
          {PROPERTIES_UI_CONTROLS}
        </div>
      </InputGroup>

      {(isCreating || (isUpdating && canUpdate)) && (
        <div className="flex justify-between space-x-2">
          <div>
            {canDelete && (
              <ButtonSecondary disabled={isPending} destructive onClick={handleDelete}>
                {t("shared.delete")}
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            {onCancel && <ButtonSecondary onClick={onCancel}>{t("shared.cancel")}</ButtonSecondary>}
            <ButtonPrimary disabled={isPending} type="submit">
              {item ? t("shared.save") : t("shared.create")}
            </ButtonPrimary>
          </div>
        </div>
      )}

      <ConfirmModal ref={confirmDelete} onYes={onDeleteConfirmed} />
      <ActionResultModal actionData={actionData} showSuccess={false} />
    </form>
  );
}`;

  const uiFormControls: string[] = [];
  entity.properties
    .filter((f) => !f.isDefault)
    .forEach((property, index) => {
      CodeGeneratorPropertiesHelper.uiForm({ code: uiFormControls, imports, property, index });
    });
  template = template.replace("{PROPERTIES_UI_CONTROLS}", uiFormControls.join("\n          "));

  const uniqueImports = [...new Set(imports)];
  return [...uniqueImports, template].join("\n");
}

export default {
  generate,
};
