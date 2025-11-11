"use client";

import { EntityTagsModel } from "@/db/models/entityBuilder/EntityTagsModel";
import { usePathname } from "next/navigation";
import { useState, useRef, Dispatch, SetStateAction } from "react";
import { useFormStatus } from "react-dom";
import { useTranslation } from "react-i18next";
import { Colors } from "@/lib/enums/shared/Colors";
import ColorBadge from "@/components/ui/badges/ColorBadge";
import EmptyState from "@/components/ui/emptyState/EmptyState";
import CheckEmptyCircle from "@/components/ui/icons/CheckEmptyCircleIcon";
import CheckFilledCircleIcon from "@/components/ui/icons/CheckFilledCircleIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TrashEmptyIcon from "@/components/ui/icons/TrashEmptyIcon";
import InputSelector from "@/components/ui/input/InputSelector";
import InputText from "@/components/ui/input/InputText";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";
import { getColors } from "@/lib/shared/ColorUtils";

function AddTagForm({ tagName, setTagName }: { tagName: string; setTagName: Dispatch<SetStateAction<string>> }) {
  const { t } = useTranslation();
  const { pending } = useFormStatus();
  const isAdding = pending;

  return (
    <div className="flex space-x-2">
      <InputText
        autoFocus
        className="w-full"
        name="tag-name"
        title={t("shared.newTag")}
        withLabel={false}
        placeholder={t("shared.tagName") + "..."}
        autoComplete="off"
        required
        value={tagName}
        setValue={setTagName}
        button={
          <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
            <kbd className="inline-flex items-center rounded border border-border bg-background px-1 font-sans text-sm font-medium text-muted-foreground">
              <button type="submit" disabled={isAdding}>
                <PlusIcon className="h-4 w-4" />
              </button>
            </kbd>
          </div>
        }
      />
    </div>
  );
}

export default function RowSettingsTags({ item, tags }: { item: RowWithDetailsDto; tags: EntityTagsModel[] }) {
  const { t } = useTranslation();
  const pathname = usePathname();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [tagName, setTagName] = useState("");

  const formRef = useRef<HTMLFormElement>(null);

  async function handleAddTag(formData: FormData) {
    const response = await fetch(location.pathname + location.search, {
      method: "POST",
      body: formData,
    });
    if (response.ok) {
      formRef.current?.reset();
      setTagName("");
    }
  }

  async function onChangeTag(tag: EntityTagsModel, value: string, color: Colors) {
    if (tag.value === value && tag.color === color) {
      return;
    }
    const form = new FormData();
    form.set("action", "edit-tag");
    form.set("tag-id", tag.id);
    form.set("tag-name", value);
    form.set("tag-color", color.toString());
    
    await fetch(location.pathname + location.search, {
      method: "POST",
      body: form,
    });
  }

  async function onSetRowTag(id: string, add: any) {
    const form = new FormData();
    form.set("action", "set-tag");
    form.set("tag-id", id);
    form.set("tag-action", add === true ? "add" : "remove");
    
    await fetch(location.pathname + location.search, {
      method: "POST",
      body: form,
    });
  }

  function sortedItems() {
    return tags.sort((x, y) => {
      if (x.id && y.id) {
        return x.id > y.id ? -1 : 1;
      }
      return -1;
    });
  }
  function onDeleteTag(tag: EntityTagsModel) {
    confirmDelete.current?.setValue(tag);
    confirmDelete.current?.show(t("shared.tagDelete", { 0: tag.value }), t("shared.delete"), t("shared.cancel"));
  }
  async function onConfirmDelete(tag: EntityTagsModel) {
    const form = new FormData();
    form.set("action", "delete-tag");
    form.set("tag-id", tag.id);
    
    await fetch(location.pathname + location.search, {
      method: "POST",
      body: form,
    });
  }
  return (
    <div className="space-y-2">
      <form ref={formRef} action={handleAddTag}>
        <input hidden readOnly name="action" value="new-tag" />
        <AddTagForm tagName={tagName} setTagName={setTagName} />
      </form>

      {tags.length === 0 && (
        <div>
          <EmptyState
            captions={{
              thereAreNo: t("shared.noTags"),
            }}
          />
        </div>
      )}
      {sortedItems().map((tag) => {
        return (
          <div key={tag.id} className="flex space-x-2">
            <InputText
              className="w-full"
              name={"tag-name-" + tag.id}
              title=""
              withLabel={false}
              value={tag.value}
              setValue={(value) => onChangeTag(tag, value.toString(), tag.color)}
            />
            <InputSelector
              className="w-36"
              name="color"
              title={t("models.group.color")}
              withSearch={false}
              withLabel={false}
              value={tag.color}
              setValue={(e) => onChangeTag(tag, tag.value, Number(e))}
              options={
                getColors().map((color) => {
                  return {
                    name: (
                      <div className="flex items-center space-x-2">
                        <ColorBadge color={color} />
                        {/* <div>{t("app.shared.colors." + Colors[color])}</div> */}
                      </div>
                    ),
                    value: color,
                  };
                }) ?? []
              }
            ></InputSelector>
            {/* <InputCheckbox
                  name={"tag-checked-" + tag.id}
                  title=""
                  value={data.item.tags.find((f) => f.tagId === tag.id) !== undefined}
                  setValue={(e) => onSetRowTag(tag.id, e)}
                /> */}
            <button
              type="button"
              onClick={() => onSetRowTag(tag.id, item.tags.filter((f) => f.tagId === tag.id).length === 0)}
              className="focus:outline-hidden"
            >
              {item.tags.filter((f) => f.tagId === tag.id).length > 0 ? (
                <CheckFilledCircleIcon className="h-4 w-4 text-teal-500 hover:text-teal-600" />
              ) : (
                <CheckEmptyCircle className="h-4 w-4 text-muted-foreground hover:text-muted-foreground" />
              )}
            </button>
            <button type="button" onClick={() => onDeleteTag(tag)} className="focus:outline-hidden">
              <TrashEmptyIcon className="h-4 w-4 text-muted-foreground hover:text-red-600" />
            </button>
          </div>
        );
      })}

      <ConfirmModal ref={confirmDelete} onYes={onConfirmDelete} destructive />
    </div>
  );
}
