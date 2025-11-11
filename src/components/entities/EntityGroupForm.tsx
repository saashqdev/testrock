"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import UrlUtils from "@/utils/app/UrlUtils";
import { EntityDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import InputText, { RefInputText } from "../ui/input/InputText";
import FormGroup from "../ui/forms/FormGroup";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import InputCheckboxCards from "../ui/input/InputCheckboxCards";
import { useTranslation } from "react-i18next";
import EntityIcon from "../layouts/icons/EntityIcon";
import InputCheckboxWithDescription from "../ui/input/InputCheckboxWithDescription";
import InputSelector from "../ui/input/InputSelector";
import { EntityViewsWithTenantAndUserDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { updateEntityGroupAction, deleteEntityGroupAction } from "@/app/admin/entities/groups/[id]/page";

export function EntityGroupForm({
  item,
  allEntities,
  systemViews,
}: {
  item: EntityGroupWithDetailsDto | undefined;
  allEntities: EntityDto[];
  systemViews: EntityViewsWithTenantAndUserDto[];
}) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const router = useRouter();

  const [title, setTitle] = useState(item?.title ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [icon, setIcon] = useState(
    item?.icon ??
      `<svg stroke="currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5">   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /> </svg>`
  );
  const [collapsible, setCollapsible] = useState(item?.collapsible ?? false);
  const [section, setSection] = useState(item?.section ?? "");
  const [entities, setEntities] = useState<{ entityId: string; allViewId: string | null }[]>(item?.entities ?? []);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>();
  const [success, setSuccess] = useState<string>();

  const input = useRef<RefInputText>(null);
  useEffect(() => {
    setTimeout(() => {
      input.current?.input.current?.focus();
    }, 100);
  }, []);

  useEffect(() => {
    if (!item) {
      const slug = UrlUtils.slugify(title.toLowerCase());
      setSlug(slug);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [title]);

  async function handleSubmit(formData: FormData) {
    if (!item?.id) return;
    
    setIsSubmitting(true);
    setError(undefined);
    setSuccess(undefined);
    
    try {
      const result = await updateEntityGroupAction(item.id, formData);
      if (result?.error) {
        setError(result.error);
      }
      // If successful, the action will redirect automatically
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete() {
    if (!item?.id) return;
    
    setIsSubmitting(true);
    setError(undefined);
    setSuccess(undefined);
    
    try {
      const result = await deleteEntityGroupAction(item.id);
      if (result?.success) {
        setSuccess(result.success);
        // Redirect after successful deletion
        router.push("/admin/entities/groups");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <FormGroup
      id={item?.id}
      onCancel={() => router.push("/admin/entities/groups")}
      editing={true}
      canDelete={getUserHasPermission(appOrAdminData, "admin.entities.delete")}
      onSubmit={handleSubmit}
      onDelete={handleDelete}
      state={{ submitting: isSubmitting }}
      message={{ error, success }}
    >
      <div className="space-y-2">
        <div className="flex justify-between space-x-2">
          <InputText ref={input} autoFocus name="title" title="Title" value={title} setValue={setTitle} required />
          <InputText name="slug" title="Slug" value={slug} setValue={setSlug} required onBlur={() => setSlug(UrlUtils.slugify(slug))} />
        </div>
        <InputText
          className="col-span-12"
          name="icon"
          title={t("models.entity.icon")}
          value={icon}
          setValue={setIcon}
          hint={<div className="text-muted-foreground">SVG or image URL sidebar icon</div>}
          button={
            <div className="absolute inset-y-0 right-0 flex py-0.5 pr-0.5">
              <kbd className="inline-flex w-10 items-center justify-center rounded border border-border bg-secondary px-1 text-center font-sans text-xs font-medium text-muted-foreground">
                {icon ? <EntityIcon className="h-7 w-7 text-muted-foreground" icon={icon} title={title} /> : <span className="text-red-600">?</span>}
              </kbd>
            </div>
          }
        />
        <InputText name="section" title="Section" value={section} setValue={setSection} />
        <InputCheckboxWithDescription
          name="collapsible"
          title="Collapsible"
          value={collapsible}
          onChange={setCollapsible}
          description="Sidebar item is collapsible"
        />
        <InputCheckboxCards
          display="name"
          columns={allEntities.length === 1 ? 1 : 2}
          name="entities"
          title="Entities"
          value={entities.map((f) => f.entityId)}
          selectAndClearAll
          onChange={(e) =>
            setEntities(
              e.map((v) => ({
                entityId: v.toString(),
                allViewId: entities.find((f) => f.entityId === v.toString())?.allViewId ?? null,
              }))
            )
          }
          options={allEntities.map((v) => ({ value: v.id, name: `${t(v.title)}` }))}
        />

        <div>
          {/* <label className="mb-1 flex justify-between space-x-2 text-xs font-medium">Layouts</label> */}
          <div className="space-y-1">
            {entities
              .filter((f) => systemViews.some((v) => v.entityId === f.entityId))
              .map((f, idx) => {
                const entity = allEntities.find((e) => e.id === f.entityId);
                if (!entity) {
                  return <div key={f.entityId}>Invalid entity</div>;
                }
                const entitySystemViews = systemViews.filter((v) => v.entityId === entity.id);
                return (
                  <InputSelector
                    withSearch={false}
                    key={f.entityId}
                    title={`${entity.title} layout`}
                    value={f.allViewId ?? undefined}
                    setValue={(e) => {
                      const newEntities = [...entities];
                      newEntities[idx].allViewId = e?.toString() ?? null;
                      setEntities(newEntities);
                    }}
                    options={entitySystemViews.map((f) => {
                      return {
                        value: f.id,
                        name: `${f.title} (${f.layout})`,
                      };
                    })}
                    hint={
                      <>
                        {!!f.allViewId && (
                          <button
                            type="button"
                            onClick={() => {
                              const newEntities = [...entities];
                              const entity = entities.find((e) => e.entityId === f.entityId);
                              if (entity) {
                                entity.allViewId = null;
                              }
                              setEntities(newEntities);
                            }}
                            className="text-xs text-muted-foreground"
                          >
                            {t("shared.clear")}
                          </button>
                        )}
                      </>
                    }
                  />
                );
              })}
          </div>
        </div>

        {entities.map((item) => {
          return <input key={item.entityId} type="hidden" name={"entities[]"} value={JSON.stringify(item)} />;
        })}
      </div>
    </FormGroup>
  );
}
