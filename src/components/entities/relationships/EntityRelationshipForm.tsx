"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import FormGroup from "@/components/ui/forms/FormGroup";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import InputRadioGroup from "@/components/ui/input/InputRadioGroup";
import InputSelector from "@/components/ui/input/InputSelector";
import InputText from "@/components/ui/input/InputText";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";

interface Props {
  entity: EntityWithDetailsDto;
  entities: EntityWithDetailsDto[];
  item?: EntityRelationshipWithDetailsDto;
  onSubmit?: (formData: FormData) => Promise<{ error?: string } | void>;
}

export default function EntityRelationshipForm({ entity, entities, item, onSubmit }: Props) {
  const { t } = useTranslation();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const [type, setType] = useState<string>(!item ? "child" : item.parentId === entity?.id ? "parent" : "child");
  const [parentId, setParentId] = useState<string | undefined>(item?.parentId);
  const [childId, setChildId] = useState<string | undefined>(item?.childId);
  const [child, setChild] = useState<EntityWithDetailsDto>();
  const [parent, setParent] = useState<EntityWithDetailsDto>();
  const [title, setTitle] = useState(item?.title ?? "");
  const [relationshipType, setRelationshipType] = useState(item?.type ?? "one-to-many");
  const [required, setRequired] = useState(item ? item.required : false);
  const [cascade, setCascade] = useState(item ? item.cascade : false);
  const [readOnly, setReadOnly] = useState(item ? item.readOnly : false);
  const [hiddenIfEmpty, setHiddenIfEmpty] = useState(item ? item.hiddenIfEmpty : false);
  const [childEntityViewId, setChildEntityViewId] = useState(item?.childEntityViewId ?? undefined);
  const [parentEntityViewId, setParentEntityViewId] = useState(item?.parentEntityViewId ?? undefined);

  const handleSubmit = async (formData: FormData) => {
    if (!onSubmit) return;

    setIsLoading(true);
    setError(undefined);

    try {
      const result = await onSubmit(formData);
      if (result && result.error) {
        setError(result.error);
      }
    } catch (e: any) {
      setError(e.message || "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (type === "parent") {
      setParentId(entity?.id);
      setChildId(undefined);
    } else {
      setParentId(undefined);
      setChildId(entity?.id);
    }
  }, [entity, type, entities]);

  useEffect(() => {
    setChild(entities.find((i) => i.id === childId));
  }, [childId, entities]);

  useEffect(() => {
    setParent(entities.find((i) => i.id === parentId));
  }, [parentId, entities]);

  return (
    <div className="space-y-2">
      {/* <h3 className="border-b border-border pb-4 text-lg font-medium leading-3 text-foreground">{t(entity.title)} relationship</h3> */}
      <FormGroup
        id={item?.id}
        editing={true}
        onSubmit={handleSubmit}
        message={{ error }}
        state={{
          loading: isLoading,
          submitting: isLoading,
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          <InputRadioGroup
            className="col-span-2"
            name="type"
            title="Direction"
            value={type}
            disabled={item !== undefined}
            onChange={(e) => setType(e?.toString() ?? "")}
            options={[
              {
                name: `${t(entity.title)} is parent`,
                value: "parent",
              },
              {
                name: `${t(entity.title)} is child`,
                value: "child",
              },
            ]}
          />
          {type === "child" && (
            <InputSelector
              className="col-span-2"
              withSearch={false}
              name="parentId"
              title="Parent entity"
              value={parentId}
              disabled={item !== undefined}
              setValue={(e) => setParentId(e?.toString() ?? "")}
              options={entities.map((i) => {
                return {
                  value: i.id,
                  name: t(i.title),
                };
              })}
              required
            />
          )}
          {type === "parent" && (
            <InputSelector
              className="col-span-2"
              withSearch={false}
              name="childId"
              title="Child entity"
              value={childId}
              disabled={item !== undefined}
              setValue={(e) => setChildId(e?.toString() ?? "")}
              options={entities.map((i) => {
                return {
                  value: i.id,
                  name: t(i.title),
                };
              })}
              required
            />
          )}
          <InputSelector
            withSearch={false}
            className="col-span-2"
            name="relationshipType"
            title="Relationship type"
            value={relationshipType}
            setValue={(e) => setRelationshipType(e?.toString() ?? "one-to-many")}
            options={[
              { name: "One to many", value: "one-to-many" },
              { name: "One to one", value: "one-to-one" },
              { name: "Many to one", value: "many-to-one" },
              { name: "Many to many", value: "many-to-many" },
            ]}
            required
          />
          <InputSelector
            disabled={child?.views.filter((f) => f.isSystem).length === 0}
            withSearch={false}
            className="col-span-2"
            name="childEntityViewId"
            title="Children view"
            value={childEntityViewId}
            setValue={(e) => setChildEntityViewId(e?.toString() ?? undefined)}
            options={
              child?.views
                .filter((f) => f.isSystem)
                .map((f) => {
                  return {
                    value: f.id,
                    name: `${f.title} (${f.layout})`,
                  };
                }) ?? []
            }
            hint={
              <>
                {childEntityViewId !== undefined && (
                  <button type="button" onClick={() => setChildEntityViewId(undefined)} className="text-sm text-muted-foreground hover:text-foreground/80">
                    {t("shared.clear")}
                  </button>
                )}
              </>
            }
          />
          <InputSelector
            disabled={parent?.views.filter((f) => f.isSystem).length === 0}
            withSearch={false}
            className="col-span-2"
            name="parentEntityViewId"
            title="Parent view"
            value={parentEntityViewId}
            setValue={(e) => setParentEntityViewId(e?.toString() ?? undefined)}
            options={
              parent?.views
                .filter((f) => f.isSystem)
                .map((f) => {
                  return {
                    value: f.id,
                    name: `${f.title} (${f.layout})`,
                  };
                }) ?? []
            }
            hint={
              <>
                {childEntityViewId !== undefined && (
                  <button type="button" onClick={() => setChildEntityViewId(undefined)} className="text-sm text-muted-foreground hover:text-foreground/80">
                    {t("shared.clear")}
                  </button>
                )}
              </>
            }
          />
          <InputCheckboxWithDescription
            className="col-span-2"
            name="required"
            title="Required"
            description="When creating the parent, the child must be created"
            value={required}
            onChange={(e) => setRequired(Boolean(e))}
          />
          <InputCheckboxWithDescription
            className="col-span-2"
            name="cascade"
            title="Cascade delete"
            description="When deleting the parent, delete all children"
            value={cascade}
            onChange={(e) => setCascade(Boolean(e))}
          />
          <InputCheckboxWithDescription
            className="col-span-2"
            name="readOnly"
            title="Read only"
            description="Can be set while creating or editing"
            value={readOnly}
            onChange={(e) => setReadOnly(Boolean(e))}
          />
          <InputCheckboxWithDescription
            className="col-span-2"
            name="hiddenIfEmpty"
            title="Hidden if empty"
            description="Hide the field if there are no children"
            value={hiddenIfEmpty}
            onChange={(e) => setHiddenIfEmpty(Boolean(e))}
          />
          <InputText className="col-span-2" name="title" title="Title (optional)" value={title} setValue={(e) => setTitle(e)} />
        </div>
      </FormGroup>
    </div>
  );
}
