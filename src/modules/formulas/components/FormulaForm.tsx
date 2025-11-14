"use client";

import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputText from "@/components/ui/input/InputText";
import InputSelect from "@/components/ui/input/InputSelect";
import { FormulaCalculationTriggerTypes, FormulaComponentDto, FormulaDto, FormulaResultAsTypes } from "../dtos/FormulaDto";
import FormulaHelpers from "../utils/FormulaHelpers";
import FormulaComponentModal from "./FormulaComponentModal";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import FormulaComponentBadge from "./FormulaComponentBadge";

interface FormulaFormProps {
  item?: FormulaDto;
  onDelete?: () => void;
  updateFormula?: (formData: FormData) => Promise<void>;
  deleteFormula?: () => Promise<void>;
  onCancel?: () => void;
}

export default function FormulaForm({ item, onDelete, updateFormula, deleteFormula, onCancel }: FormulaFormProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const confirmModalDelete = useRef<RefConfirmModal>(null);

  const [showModal, setShowModal] = useState<{
    item?: FormulaComponentDto;
    idx?: number;
  }>();

  const [name, setName] = useState(item?.name || "");
  const [description, setDescription] = useState(item?.description || "");
  const [resultAs, setResultAs] = useState(item?.resultAs || "number");
  const [calculationTrigger, setCalculationTrigger] = useState(item?.calculationTrigger || "IF_UNSET");
  const [withLogs, setWithLogs] = useState(item?.withLogs || false);

  const [components, setComponents] = useState<FormulaComponentDto[]>(item?.components || []);
  const [error, setError] = useState<string | null>(null);

  function onSave(item: FormulaComponentDto) {
    const idx = showModal?.idx;
    if (idx !== undefined) {
      components[idx] = item;
    } else {
      components.push({
        ...item,
        order: components.length + 1,
      });
    }
    setComponents([...components]);
    setShowModal(undefined);
  }

  function getActionName() {
    return item ? "edit" : "new";
  }

  function onDeleteClick() {
    confirmModalDelete.current?.show("Delete formula", "Delete", "Cancel", "Are you sure you want to delete this formula?");
  }

  async function handleDelete() {
    if (deleteFormula) {
      startTransition(async () => {
        try {
          await deleteFormula();
        } catch (err: any) {
          setError(err.message || "Failed to delete formula");
        }
      });
    } else if (onDelete) {
      onDelete();
    }
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (!updateFormula) {
      // Fallback to traditional form submission if no Server Action provided
      e.currentTarget.submit();
      return;
    }

    setError(null);
    
    const formData = new FormData(e.currentTarget);
    
    startTransition(async () => {
      try {
        await updateFormula(formData);
      } catch (err: any) {
        setError(err.message || "Failed to save formula");
      }
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value={getActionName()} hidden readOnly />
        {components.map((component, index) => {
          return <input type="hidden" name="components[]" value={JSON.stringify(component)} key={index} hidden readOnly />;
        })}

        {error && (
          <div className="mb-4 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-2">
          <InputText autoFocus name="name" title="Name" value={name} setValue={setName} required />
          <InputText name="description" title="Description" value={description} setValue={setDescription} />
          <InputSelect
            name="resultAs"
            title="Result as"
            value={resultAs}
            onChange={(e) => setResultAs(FormulaHelpers.getResultAs(e?.toString() ?? ""))}
            options={FormulaResultAsTypes.map((item) => {
              return { name: item, value: item };
            })}
          />

          <InputSelect
            name="calculationTrigger"
            title={"Calculation trigger"}
            value={calculationTrigger}
            onChange={(e) => setCalculationTrigger(FormulaHelpers.getCalculationTrigger(e?.toString() ?? ""))}
            options={FormulaCalculationTriggerTypes.map((item) => {
              return { name: item, value: item };
            })}
          />

          <InputCheckboxWithDescription
            className="col-span-2"
            name="withLogs"
            title="With logs"
            description="If checked, all calculations will be logged"
            value={withLogs}
            onChange={setWithLogs}
          />

          <div className="col-span-2">
            <div className="mb-1 flex items-center justify-between space-x-2 text-xs">
              <label className="font-medium text-muted-foreground">Components</label>
              <button type="button" onClick={() => setComponents([])} className="text-muted-foreground hover:text-foreground/80">
                {t("shared.clear")}
              </button>
            </div>

            <div className="flex flex-wrap text-foreground">
              {components.map((item, idx) => {
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setShowModal({ item, idx: idx })}
                    className="focus:outline-hidden relative m-1 block rounded-lg border-2 border-dashed border-border p-1 text-center text-sm hover:border-border focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  >
                    <FormulaComponentBadge item={item} />
                  </button>
                );
              })}

              <div className="">
                <button
                  type="button"
                  onClick={() => setShowModal({ item: undefined, idx: undefined })}
                  className="focus:outline-hidden relative m-1 block w-full rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 p-1 text-center text-blue-600 hover:border-blue-400 hover:bg-blue-100 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <span className="block text-sm font-medium">Add component</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-5 flex justify-between space-x-2 sm:mt-6">
          <div>
            {(onDelete || deleteFormula) && getUserHasPermission(appOrAdminData, "admin.formulas.delete") && (
              <ButtonSecondary type="button" className="w-full" onClick={onDeleteClick} destructive disabled={isPending}>
                <div>{t("shared.delete")}</div>
              </ButtonSecondary>
            )}
          </div>
          <div className="flex space-x-2">
            <ButtonSecondary 
              onClick={() => onCancel ? onCancel() : router.push("/admin/entities/formulas")} 
              disabled={isPending}
            >
              {t("shared.cancel")}
            </ButtonSecondary>
            <LoadingButton actionName={getActionName()} type="submit" disabled={isPending}>
              {isPending ? t("shared.saving") || "Saving..." : t("shared.save")}
            </LoadingButton>
          </div>
        </div>
      </form>

      <FormulaComponentModal
        open={showModal !== undefined}
        item={showModal?.item}
        idx={showModal?.idx}
        order={components.length + 1}
        onClose={() => setShowModal(undefined)}
        onSave={(item) => onSave(item)}
        onRemove={(idx) => {
          components.splice(idx, 1);
          setComponents([...components]);
        }}
      />

      <ConfirmModal ref={confirmModalDelete} onYes={handleDelete} />
    </div>
  );
}
