"use client";

import { RowWithDetailsDto, RowWithValuesDto } from "@/db/models/entityBuilder/RowsModel";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { Dispatch, forwardRef, Fragment, ReactNode, Ref, SetStateAction, useEffect, useImperativeHandle, useMemo, useRef, useState, useCallback } from "react";
import clsx from "clsx";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { RowValueDto } from "@/lib/dtos/entities/RowValueDto";
import FormGroup, { RefFormGroup } from "@/components/ui/forms/FormGroup";
import InputGroup from "@/components/ui/forms/InputGroup";
import RowHelper from "@/lib/helpers/RowHelper";
import RowValueInput, { RefRowValueInput } from "./RowValueInput";
import PropertyAttributeHelper from "@/lib/helpers/PropertyAttributeHelper";
import { PropertyAttributeName } from "@/lib/enums/entities/PropertyAttributeName";
import { useTranslation } from "react-i18next";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import RowListFetcher from "@/modules/rows/fetchers/RowListFetcher";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { Routes } from "@/utils/api/server/EntitiesApi";
import EntityHelper from "@/lib/helpers/EntityHelper";
import { GetRelationshipRowsData } from "@/utils/api/server/RowsApi";
import { RowValueMultipleDto } from "@/lib/dtos/entities/RowValueMultipleDto";
import RelationshipHelper from "@/lib/helpers/RelationshipHelper";
import RowsList from "./RowsList";
import { EntityViewsWithDetailsDto } from "@/db/models/entityBuilder/EntityViewsModel";
import { RowDisplayDefaultProperty } from "@/lib/helpers/PropertyHelper";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { PromptFlowWithDetailsDto } from "@/db/models/promptFlows/PromptFlowsModel";
import RowUrlHelper from "@/lib/helpers/RowUrlHelper";

export interface RefRowForm {
  save: () => void;
}

interface Props {
  entity: EntityWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  routes?: Routes;
  item?: RowWithDetailsDto | null;
  editing?: boolean;
  adding?: boolean;
  onSubmit?: (formData: FormData) => void;
  canUpdate?: boolean;
  canDelete?: boolean;
  canSubmit?: boolean;
  children?: ReactNode;
  parentEntity?: EntityWithDetailsDto;
  onCreatedRedirect?: string;
  onDelete?: () => void;
  relationshipRows?: GetRelationshipRowsData;
  hiddenProperties?: string[];
  hiddenFields?: {
    [key: string]: string | null | undefined;
  };
  state?: { loading?: boolean; submitting?: boolean };
  createdRow?: RowWithDetailsDto;
  onCancel?: () => void;
  onChange?: (values: RowValueDto[]) => void;
  customSearchParams?: URLSearchParams;
  promptFlows?: PromptFlowWithDetailsDto[];
  template?: { title: string; config: string } | null;
}

const RowForm = (
  {
    entity,
    routes,
    item,
    editing = false,
    adding,
    onSubmit,
    canUpdate,
    canDelete,
    canSubmit = true,
    children,
    parentEntity,
    onCreatedRedirect,
    allEntities,
    onDelete,
    relationshipRows,
    hiddenProperties,
    hiddenFields,
    state,
    createdRow,
    onCancel,
    onChange,
    customSearchParams,
    promptFlows,
    template,
  }: Props,
  ref: Ref<RefRowForm>
) => {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useParams();
  // const actionData = useActionData<{ newRow?: RowWithDetails }>();

  const formGroup = useRef<RefFormGroup>(null);

  const [searchParams] = useSearchParams();
  const searchParamsString = searchParams?.toString() || "";
  // Memoize to avoid creating new URLSearchParams on every render
  const newSearchParams = useMemo(() => new URLSearchParams(searchParamsString), [searchParamsString]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchingRelationshipRows, setSearchingRelationshipRows] = useState<EntityRelationshipWithDetailsDto>();
  const [selectedRelatedEntity, setSelectedRelatedEntity] = useState<{
    entity: { slug: string; onEdit: string | null };
    view: EntityViewsWithDetailsDto | null;
    multiple: boolean;
  }>();
  const [relatedRows, setRelatedRows] = useState<{ relationship: EntityRelationshipWithDetailsDto; rows: RowWithValuesDto[] }[]>([]);

  const [headers, setHeaders] = useState<RowValueDto[]>([]);

  const [childrenEntities, setChildrenEntities] = useState<{ visible: EntityRelationshipWithDetailsDto[]; hidden: EntityRelationshipWithDetailsDto[] }>({
    visible: [],
    hidden: [],
  });
  const [parentEntities, setParentEntities] = useState<{ visible: EntityRelationshipWithDetailsDto[]; hidden: EntityRelationshipWithDetailsDto[] }>({
    visible: [],
    hidden: [],
  });

  useEffect(() => {
    loadInitialFields();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.entity, params.group, customSearchParams, template]);

  useEffect(() => {
    if (onChange) {
      onChange(headers);
    }
  }, [headers, onChange]);

  // useEffect(() => {
  //   if (headers.length > 0) {
  //     rowValueInput.current?.focus();
  //   }
  // }, [headers])

  // useEffect(() => {
  //   if (actionData?.newRow && onCreated) {
  //     onCreated(actionData.newRow);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [actionData]);

  useEffect(() => {
    if (searchingRelationshipRows?.parentId === entity.id) {
      setSelectedRelatedEntity({
        entity: searchingRelationshipRows.child,
        view: searchingRelationshipRows.childEntityView,
        multiple: true,
      });
    } else if (searchingRelationshipRows?.childId === entity.id) {
      setSelectedRelatedEntity({
        entity: searchingRelationshipRows.parent,
        view: searchingRelationshipRows.parentEntityView,
        multiple: false,
      });
    }
  }, [entity.id, searchingRelationshipRows]);

  useImperativeHandle(ref, () => ({
    save,
  }));
  function save() {
    formGroup.current?.submitForm();
  }

  function loadInitialFields() {
    const initial: RowValueDto[] = [];
    if (template && !customSearchParams) {
      const config = JSON.parse(template.config);
      const defaultValues: { [key: string]: any } = {};
      Object.keys(config).forEach((key) => {
        defaultValues[key] = config[key];
      });
      customSearchParams = new URLSearchParams(defaultValues);
    }
    entity.properties
      ?.filter((f) => isPropertyVisible(f))
      .forEach((property) => {
        const existing = item?.values?.find((f) => f?.propertyId === property.id);

        const searchParamsToUse = customSearchParams ?? newSearchParams;
        const defaultValueString =
          RowUrlHelper.getString({ urlSearchParams: searchParamsToUse, property }) ??
          PropertyAttributeHelper.getPropertyAttributeValue_String(property, PropertyAttributeName.DefaultValue);
        const defaultValueNumber =
          RowUrlHelper.getNumber({ urlSearchParams: searchParamsToUse, property }) ??
          PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.DefaultValue);
        const defaultValueBoolean =
          RowUrlHelper.getBoolean({ urlSearchParams: searchParamsToUse, property }) ??
          PropertyAttributeHelper.getPropertyAttributeValue_Boolean(property, PropertyAttributeName.DefaultValue);

        let defaultDate = RowUrlHelper.getDate({ urlSearchParams: searchParamsToUse, property }) ?? undefined;
        const defaultRange = RowUrlHelper.getRange({ urlSearchParams: searchParamsToUse, property }) ?? undefined;

        const defaultMultiple = RowUrlHelper.getMultiple({ urlSearchParams: searchParamsToUse, property }) ?? undefined;

        initial.push({
          propertyId: property.id,
          property: property,
          textValue: existing?.textValue ?? defaultValueString ?? undefined,
          numberValue: existing?.numberValue ? Number(existing?.numberValue) : defaultValueNumber,
          dateValue: existing?.dateValue ?? defaultDate,
          booleanValue: existing ? Boolean(existing?.booleanValue) : defaultValueBoolean,
          selectedOption: existing?.textValue ?? defaultValueString ?? undefined,
          media: existing?.media ?? [],
          multiple: existing?.multiple.sort((a: RowValueMultipleDto, b: RowValueMultipleDto) => a.order - b.order) ?? defaultMultiple ?? [],
          range: existing?.range ?? defaultRange,
        });
      });

    const relatedRows: { relationship: EntityRelationshipWithDetailsDto; rows: RowWithValuesDto[] }[] = [];
    if (item) {
      entity.parentEntities.forEach((relationship) => {
        if (item.parentRows?.length > 0) {
          relatedRows.push({
            relationship,
            rows: item.parentRows.filter((f) => f.relationshipId === relationship.id).map((i) => i.parent),
          });
        }
      });
      entity.childEntities.forEach((relationship) => {
        if (item.childRows?.length > 0) {
          relatedRows.push({
            relationship,
            rows: item.childRows.filter((f) => f.relationshipId === relationship.id).map((i) => i.child),
          });
        }
      });
    } else {
      entity.parentEntities.forEach((relationship) => {
        const rowId = customSearchParams?.get(relationship.parent.name) ?? newSearchParams.get(relationship.parent.name);
        if (rowId) {
          const foundRow = relationshipRows
            ?.filter((f) => f.relationship.id === relationship.id)
            .map((m) => m.rows)
            .flat()
            .find((f) => f.id === rowId);
          relatedRows.push({
            relationship,
            rows: foundRow ? [foundRow] : [],
          });
        }
      });
    }

    const allChildren = entity.childEntities.filter((f) => childEntityVisible(f) && allEntities.find((x) => x.id === f.childId));
    setChildrenEntities(getVisibleRelatedEntities(allChildren, relatedRows));
    const allParents = entity.parentEntities.filter((f) => f.parentId !== parentEntity?.id && allEntities.find((x) => x.id === f.parentId));
    setParentEntities(getVisibleRelatedEntities(allParents, relatedRows));

    setHeaders(initial);
    setRelatedRows(relatedRows);
  }

  function onFindEntityRows(relationship: EntityRelationshipWithDetailsDto) {
    if (!routes) {
      return;
    }
    setSearchingRelationshipRows(relationship);
  }

  function addRelationshipRow(relationship: EntityRelationshipWithDetailsDto, rows: RowWithDetailsDto[]) {
    const newRelatedRows = [...relatedRows];
    const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
    if (existing) {
      if (relationship.parentId === entity.id) {
        const nonExistingRows = rows.filter((f) => !existing.rows.find((ff) => ff.id === f.id));
        existing.rows = [...existing.rows, ...nonExistingRows];
      } else {
        existing.rows = rows;
      }
    } else {
      newRelatedRows.push({ relationship, rows });
    }
    setRelatedRows(newRelatedRows);
  }

  function setRelationshipRows(relationship: EntityRelationshipWithDetailsDto, rows: RowWithDetailsDto[]) {
    const newRelatedRows = [...relatedRows];
    const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
    if (existing) {
      existing.rows = rows;
    } else {
      newRelatedRows.push({ relationship, rows });
    }
    setRelatedRows(newRelatedRows);
  }

  const onRemoveRelatedRow = useCallback((relationship: EntityRelationshipWithDetailsDto, row: RowWithValuesDto) => {
    setRelatedRows((prevRelatedRows) => {
      const newRelatedRows = [...prevRelatedRows];
      const existing = newRelatedRows.find((f) => f.relationship.id === relationship.id);
      if (existing) {
        existing.rows = existing.rows.filter((f) => f.id !== row.id);
      }
      return newRelatedRows;
    });
  }, []); // No dependencies needed since we use functional setState

  function submitForm(formData: FormData) {
    if (onSubmit) {
      setIsSubmitting(true);
      try {
        onSubmit(formData);
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // For Next.js, you would typically handle form submission through server actions
      // or API routes rather than using a submit function
      console.warn("No onSubmit handler provided for form submission");
    }
  }

  function isPropertyVisible(f: PropertyWithDetailsDto) {
    if (f.isHidden || (!item && !f.showInCreate) || (!item && f.isReadOnly) || (item && editing && f.isReadOnly)) {
      return false;
    } else if (hiddenProperties?.includes(f.name)) {
      return false;
    }
    if (item && editing && !f.canUpdate) {
      return false;
    }

    return true;
  }

  function childEntityVisible(f: EntityRelationshipWithDetailsDto) {
    if (f.readOnly) {
      if (!item) {
        return false;
      }
      if (item && editing) {
        return false;
      }
    }
    return true;
  }

  function canSubmitForm() {
    if (!canSubmit) {
      return false;
    }
    const required = headers.filter((f) => f.property.isRequired);
    let hasError = false;
    required.forEach((f) => {
      if (f.property.type === PropertyType.MEDIA) {
        if (f.media?.length === 0) {
          hasError = true;
        }
      }
    });
    return !hasError;
  }

  function isAddingOrEditing() {
    if (adding) {
      return true;
    }
    if (editing && item && canUpdate && !isSubmitting) {
      return true;
    }
    return false;
  }

  function onSaveIfAllSet() {
    return;
    // if (item) {
    //   return;
    // }
    // const missingValues = headers
    //   .filter((f) => isPropertyVisible(f.property))
    //   .map((header) => {
    //     if ([PropertyType.TEXT, PropertyType.SELECT].includes(header.property.type) && !header.textValue) {
    //       return header;
    //     } else if ([PropertyType.NUMBER].includes(header.property.type) && !header.numberValue) {
    //       return header;
    //     } else if ([PropertyType.DATE].includes(header.property.type) && !header.dateValue) {
    //       return header;
    //     }
    //     // else if ([PropertyType.MEDIA].includes(header.property.type) && (!header.media || header.media.length === 0)) {
    //     //   return header;
    //     // }
    //     else if ([PropertyType.MULTI_SELECT].includes(header.property.type) && (!header.multiple || header.multiple.length === 0)) {
    //       return header;
    //     }
    //     return null;
    //   });
    // const rowValues = missingValues.filter((f) => f !== null);

    // if (rowValues.length === 0) {
    //   formGroup.current?.submitForm();
    // }
  }

  return (
    <>
      <FormGroup
        ref={formGroup}
        id={item?.id}
        editing={editing}
        canDelete={canDelete}
        onSubmit={submitForm}
        onDelete={onDelete}
        canUpdate={canUpdate}
        canSubmit={canSubmit}
        onCancel={onCancel}
        submitDisabled={!canSubmitForm()}
        onCreatedRedirect={onCreatedRedirect}
        deleteRedirect={EntityHelper.getRoutes({ routes, entity })?.list}
        state={state || { submitting: isSubmitting }}
        message={
          createdRow
            ? { success: t("shared.created") + ": " + RowHelper.getTextDescription({ entity, item: createdRow, t, defaultsToFolio: true }) }
            : undefined
        }
      >
        {hiddenFields &&
          Object.keys(hiddenFields).map((f) => {
            return <Fragment key={f}>{hiddenFields[f] && <input type="hidden" name={f} value={hiddenFields[f] ?? ""} hidden readOnly />}</Fragment>;
          })}
        {!onSubmit && (
          <>
            {!item ? (
              <input type="hidden" name="redirect" value={EntityHelper.getRoutes({ routes, entity })?.list} hidden readOnly />
            ) : (
              <input type="hidden" name="redirect" value={EntityHelper.getRoutes({ routes, entity, item })?.overview} hidden readOnly />
            )}
          </>
        )}
        {onCreatedRedirect && <input type="hidden" name="onCreatedRedirect" value={onCreatedRedirect} hidden readOnly />}
        <RowGroups
          item={item}
          entity={entity}
          rowValues={headers}
          parentEntity={parentEntity}
          allEntities={allEntities}
          relatedRows={relatedRows}
          editing={editing}
          canUpdate={canUpdate}
          routes={routes}
          relationshipRows={relationshipRows}
          setHeaders={setHeaders}
          addRelationshipRow={addRelationshipRow}
          setRelationshipRows={setRelationshipRows}
          onFindEntityRows={onFindEntityRows}
          onRemoveRelatedRow={onRemoveRelatedRow}
          isPropertyVisible={isPropertyVisible}
          children={children}
          canSubmit={canSubmit}
          isAddingOrEditing={isAddingOrEditing()}
          parentEntities={{
            visible: parentEntities.visible,
            hidden: parentEntities.hidden,
            onAddParentEntity: (rel) => {
              setParentEntities((prev) => {
                return {
                  visible: [...prev.visible, rel],
                  hidden: prev.hidden.filter((f) => f.id !== rel.id),
                };
              });
            },
          }}
          promptFlows={promptFlows}
          onSaveIfAllSet={onSaveIfAllSet}
        />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
          {childrenEntities.visible.map((relationship) => (
            <div key={relationship.id} className="col-span-12">
              <div className="space-y-2">
                <h3 className="text-sm font-medium leading-3 text-foreground">
                  <div className="flex items-center space-x-1">
                    <div>
                      <span className="font-light italic"></span> {t(RelationshipHelper.getTitle({ fromEntityId: entity.id, relationship }))}
                      {/* {relationship.required && <span className="ml-1 text-red-500">*</span>} */}
                    </div>
                  </div>
                </h3>
                <RelationshipSelector
                  fromEntity={entity}
                  type="child"
                  relationship={relationship}
                  relatedRows={relatedRows}
                  onFindEntityRows={onFindEntityRows}
                  allEntities={allEntities}
                  onRemoveRelatedRow={onRemoveRelatedRow}
                  readOnly={item?.id !== undefined && (!editing || !canUpdate)}
                  routes={routes}
                  relationshipRows={relationshipRows}
                  addRelationshipRow={addRelationshipRow}
                  setRelationshipRows={setRelationshipRows}
                />
              </div>
            </div>
          ))}

          {isAddingOrEditing() && (
            <AddHiddenRelationshipEntities
              items={childrenEntities.hidden}
              onClick={(rel) => {
                setChildrenEntities((prev) => {
                  return {
                    visible: [...prev.visible, rel],
                    hidden: prev.hidden.filter((f) => f.id !== rel.id),
                  };
                });
              }}
              type="child"
            />
          )}
        </div>

        {relatedRows.map(({ relationship, rows }) => (
          <Fragment key={relationship.id}>
            {rows.map((row) => (
              // <>
              <input
                key={row.id}
                type="hidden"
                readOnly
                hidden
                name={`${relationship.childId === entity.id ? `parents[${relationship.parent.name}]` : `children[${relationship.child.name}]`}`}
                value={row.id}
              />
              // </>
            ))}
          </Fragment>
        ))}
      </FormGroup>
      {/* // <OpenModal className="sm:max-w-4xl" onClose={() => setSearchingRelationshipRows(undefined)}> */}
      <SlideOverWideEmpty
        withTitle={false}
        withClose={false}
        title={t("shared.select")}
        open={searchingRelationshipRows !== undefined}
        onClose={() => setSearchingRelationshipRows(undefined)}
      >
        {selectedRelatedEntity && searchingRelationshipRows && (
          <RowListFetcher
            currentView={selectedRelatedEntity.view}
            listUrl={EntityHelper.getRoutes({ routes, entity: selectedRelatedEntity.entity })?.list + "?view=null"}
            newUrl={EntityHelper.getRoutes({ routes, entity: selectedRelatedEntity.entity })?.new ?? ""}
            parentEntity={entity}
            onSelected={(rows) => {
              addRelationshipRow(searchingRelationshipRows, rows);
              setSearchingRelationshipRows(undefined);
            }}
            multipleSelection={selectedRelatedEntity.multiple}
            allEntities={allEntities}
          />
        )}
      </SlideOverWideEmpty>
      {/* // </OpenModal> */}
    </>
  );
};

function RelationshipSelector({
  fromEntity,
  routes,
  type,
  relationship,
  relatedRows,
  onFindEntityRows,
  className,
  allEntities,
  onRemoveRelatedRow,
  readOnly,
  relationshipRows,
  addRelationshipRow,
  setRelationshipRows,
}: {
  fromEntity: EntityWithDetailsDto;
  type: "child" | "parent";
  relationship: EntityRelationshipWithDetailsDto;
  relatedRows: { relationship: EntityRelationshipWithDetailsDto; rows: RowWithValuesDto[] }[];
  onFindEntityRows: (relationship: EntityRelationshipWithDetailsDto) => void;
  className?: string;
  allEntities: EntityWithDetailsDto[];
  onRemoveRelatedRow: (relationship: EntityRelationshipWithDetailsDto, row: RowWithValuesDto) => void;
  readOnly: boolean;
  routes?: Routes;
  relationshipRows?: GetRelationshipRowsData;
  addRelationshipRow: (relationship: EntityRelationshipWithDetailsDto, rows: RowWithDetailsDto[]) => void;
  setRelationshipRows: (relationship: EntityRelationshipWithDetailsDto, rows: RowWithDetailsDto[]) => void;
}) {
  const { t } = useTranslation();
  const [entity] = useState(
    type === "parent"
      ? {
          entity: getChildEntity(relationship)!,
          view: relationship.parentEntityView,
        }
      : {
          entity: getParentEntity(relationship)!,
          view: relationship.childEntityView,
        }
  );

  function getRows(relationship: EntityRelationshipWithDetailsDto) {
    const existing = relatedRows.find((f) => f.relationship.id === relationship.id);
    return existing?.rows.sort((a, b) => (a.order ?? 0) - (b.order ?? 0)) ?? [];
  }
  function getParentEntity(relationship: EntityRelationshipWithDetailsDto) {
    return allEntities.find((f) => f.id === relationship.childId);
  }
  function getChildEntity(relationship: EntityRelationshipWithDetailsDto) {
    return allEntities.find((f) => f.id === relationship.parentId);
  }
  
  // Memoize the onRemove callback to prevent RowsList re-renders
  const handleRemove = useCallback(
    (row: RowWithValuesDto) => {
      onRemoveRelatedRow(relationship, row);
    },
    [relationship.id, onRemoveRelatedRow]
  );
  
  return (
    <div className={className}>
      {/* <div>selectedRow: {getSelectedRow()}</div>
      <div>
        options:{" "}
        {getOptions()
          .map((f) => f.value)
          .join(",")}
      </div>
      <div>
        {relatedRows.filter((f) => f.relationship.id === relationship.id).length > 0 &&
          relatedRows
            .filter((f) => f.relationship.id === relationship.id)[0]
            .rows.map((f) => f.id)
            .join(",")}
      </div> */}
      {/* {RelationshipHelper.getInputType({ fromEntityId: fromEntity.id, relationship }) === "single-select" ? (
        <InputSelector
          className="mt-1"
          name={relationship.parent.name}
          disabled={readOnly}
          value={getSelectedRow()}
          options={getOptions()}
          setValue={(value) => {
            const row = relationshipRows?.find((f) => f.relationship.id === relationship.id)?.rows.find((f) => f.id === value);
            if (row) {
              setRelationshipRows(relationship, [row]);
            }
          }}
        />
      ) : RelationshipHelper.getInputType({ fromEntityId: fromEntity.id, relationship }) === "multi-select" ? (
        <> */}
      {getRows(relationship).length === 0 ? (
        <button
          onClick={() => onFindEntityRows(relationship)}
          type="button"
          disabled={readOnly}
          className={clsx(
            "relative block w-full rounded-lg border-2 border-dashed border-border p-4 text-center",
            readOnly ? "cursor-not-allowed bg-secondary/90" : "focus:outline-hidden bg-background hover:border-border focus:ring-2 focus:ring-gray-500"
          )}
        >
          <span className="flex items-center space-x-1 text-xs font-normal text-muted-foreground">
            {readOnly ? (
              <div>{t("shared.notSet")}</div>
            ) : (
              <>
                {type === "parent" && (
                  <>
                    <div>{t("shared.select")}</div>
                    <div className="lowercase">{t(relationship.parent.title)}</div>
                  </>
                )}
                {type === "child" && (
                  <>
                    <div>{t("shared.add")}</div>
                    <div className="lowercase">{t(relationship.child.title)}</div>
                  </>
                )}
              </>
            )}
          </span>
        </button>
      ) : (
        <div className="relative space-y-2 overflow-visible">
          <RowsList
            entity={entity.entity}
            items={getRows(relationship) as RowWithDetailsDto[]}
            currentView={entity.view}
            view={(entity.view?.layout ?? "card") as "table" | "board" | "grid" | "card"}
            readOnly={readOnly}
            onRemove={readOnly ? undefined : handleRemove}
            ignoreColumns={!readOnly ? [RowDisplayDefaultProperty.FOLIO, "parent." + relationship.parent.name, "child." + relationship.child.name] : []}
            routes={routes}
          />
          {/* {getRows(relationship).map((item) => (
                <div
                  key={item.id}
                  className={clsx(
                    "group relative w-full overflow-visible truncate rounded-md border border-border px-4 py-3 text-left text-sm",
                    !readOnly ? "bg-background hover:border-border" : "bg-secondary/90"
                  )}
                >
                  <button
                    onClick={() => onRemoveRelatedRow(relationship, item)}
                    type="button"
                    disabled={readOnly}
                    className={clsx(
                      "absolute right-0 top-0 mr-2 mt-2 hidden origin-top-right justify-center rounded-full bg-background text-muted-foreground",
                      readOnly ? "cursor-not-allowed" : "hover:text-red-500 group-hover:flex"
                    )}
                  >
                    <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </button>
                  <div className="grid grid-cols-2 gap-1">
                    <div>{RowHelper.getTextDescription({ entity, item, t, defaultsToFolio: true })}</div>
                  </div>
                </div>
              ))} */}
          <button
            onClick={() => onFindEntityRows(relationship)}
            type="button"
            className={clsx(
              "focus:outline-hidden relative flex space-x-1 rounded-md border border-dashed border-border px-2 py-1 text-center text-xs text-muted-foreground hover:border-border hover:bg-secondary focus:ring-1 focus:ring-gray-500",
              readOnly && "hidden"
            )}
          >
            {type === "parent" && (
              <>
                <div>{t("shared.select")}</div>
                <div className="lowercase">{t(relationship.parent.title)}</div>
              </>
            )}
            {type === "child" && (
              <>
                <div>{t("shared.add")}</div>
                <div className="lowercase">{t(relationship.child.title)}</div>
              </>
            )}
          </button>
        </div>
      )}
      {/* </>
      ) : null} */}
    </div>
  );
}

function RowGroups({
  item,
  entity,
  rowValues,
  parentEntity,
  allEntities,
  relatedRows,
  editing,
  canUpdate,
  routes,
  relationshipRows,
  setHeaders,
  addRelationshipRow,
  setRelationshipRows,
  onFindEntityRows,
  onRemoveRelatedRow,
  isPropertyVisible,
  children,
  canSubmit,
  isAddingOrEditing,
  parentEntities,
  promptFlows,
  onSaveIfAllSet,
}: {
  item?: RowWithDetailsDto | null;
  entity: EntityWithDetailsDto;
  rowValues: RowValueDto[];
  parentEntity?: EntityWithDetailsDto;
  allEntities: EntityWithDetailsDto[];
  relatedRows: { relationship: EntityRelationshipWithDetailsDto; rows: RowWithValuesDto[] }[];
  editing?: boolean;
  canUpdate?: boolean;
  routes?: Routes;
  relationshipRows?: GetRelationshipRowsData;
  setHeaders: Dispatch<SetStateAction<RowValueDto[]>>;
  addRelationshipRow: (relationship: EntityRelationshipWithDetailsDto, rows: RowWithDetailsDto[]) => void;
  setRelationshipRows: (relationship: EntityRelationshipWithDetailsDto, rows: RowWithDetailsDto[]) => void;
  onFindEntityRows: (relationship: EntityRelationshipWithDetailsDto) => void;
  onRemoveRelatedRow: (relationship: EntityRelationshipWithDetailsDto, row: RowWithValuesDto) => void;
  isPropertyVisible: (property: PropertyWithDetailsDto) => boolean;
  children?: ReactNode;
  canSubmit?: boolean;
  isAddingOrEditing: boolean;
  parentEntities: {
    visible: EntityRelationshipWithDetailsDto[];
    hidden: EntityRelationshipWithDetailsDto[];
    onAddParentEntity: (item: EntityRelationshipWithDetailsDto) => void;
  };
  promptFlows?: PromptFlowWithDetailsDto[];
  onSaveIfAllSet: () => void;
}) {
  const { t } = useTranslation();
  const rowValueInput = useRef<RefRowValueInput>(null);

  const groups = useMemo(() => {
    const groups: { group?: string; headers: RowValueDto[] }[] = [];
    rowValues.forEach((header) => {
      const groupName = PropertyAttributeHelper.getPropertyAttributeValue_String(header.property, PropertyAttributeName.Group);
      let found = groups.find((f) => f.group === groupName);
      if (!found) {
        found = groups.find((f) => !f.group && !groupName);
      }
      if (found) {
        found.headers.push(header);
      } else {
        groups.push({
          group: groupName,
          headers: [header],
        });
      }
    });
    if (groups.length === 0) {
      groups.push({ headers: rowValues });
    }
    return groups;
  }, [rowValues]);

  function getPropertyColumnSpan(property: PropertyWithDetailsDto) {
    const columns = PropertyAttributeHelper.getPropertyAttributeValue_Number(property, PropertyAttributeName.Columns);
    if (columns === undefined || isNaN(columns) || (columns < 1 && columns > 12)) {
      return "col-span-12";
    }
    return `col-span-${columns}`;
  }
  function onChange(rowValue: RowValueDto) {
    setHeaders((prev) => {
      return prev.map((f) => {
        if (f.propertyId === rowValue.propertyId) {
          return rowValue;
        }
        return f;
      });
    });
  }
  return (
    <>
      {groups.map(({ group, headers }, idx) => {
        return (
          <InputGroup key={idx} title={group ? t(group) : t("shared.details")}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-12">
              {headers.map((detailValue, idxDetailValue) => {
                return (
                  <div key={detailValue.propertyId} className={clsx("w-full", getPropertyColumnSpan(detailValue.property))}>
                    <RowValueInput
                      ref={rowValueInput}
                      entity={entity}
                      textValue={detailValue.textValue}
                      numberValue={detailValue.numberValue}
                      dateValue={detailValue.dateValue}
                      booleanValue={detailValue.booleanValue}
                      multiple={detailValue.multiple}
                      range={detailValue.range}
                      initialOption={detailValue.selectedOption}
                      selected={detailValue.property}
                      initialMedia={detailValue.media}
                      onChange={(e) => {
                        onChange({
                          ...detailValue,
                          ...RowHelper.updateFieldValueTypeArray(detailValue, e),
                        });
                      }}
                      onChangeOption={(e) => {
                        onChange({
                          ...detailValue,
                          selectedOption: e,
                          textValue: e,
                        });
                      }}
                      onChangeMedia={(media) => {
                        onChange({
                          ...detailValue,
                          media: media as any,
                        });
                        if (media.filter((f) => f.type).length > 0) {
                          onSaveIfAllSet();
                        }
                      }}
                      onChangeMultiple={(e) => {
                        onChange({
                          ...detailValue,
                          multiple: e as any[],
                        });
                      }}
                      onChangeRange={(e) => {
                        onChange({
                          ...detailValue,
                          range: e as any,
                        });
                      }}
                      readOnly={
                        (editing && !detailValue.property.canUpdate) || (item?.id !== undefined && (!editing || !canUpdate)) || detailValue.property?.isReadOnly
                      }
                      autoFocus={idx === 0 && idxDetailValue === 0 && canSubmit}
                      promptFlows={promptFlows ? { prompts: promptFlows, rowId: item?.id } : undefined}
                    />
                  </div>
                );
              })}
              {/* Show parent entities in Default Properties Group */}
              {!group && (
                <>
                  {parentEntities.visible.map((relationship) => (
                    <div key={relationship.id} className="col-span-12">
                      <label htmlFor={relationship.id} className="flex justify-between space-x-2 text-xs font-medium text-muted-foreground">
                        <div className="flex items-center space-x-1">
                          <div className="truncate">
                            {t(RelationshipHelper.getTitle({ fromEntityId: entity.id, relationship }))}
                            {relationship.required && <span className="ml-1 text-red-500">*</span>}
                          </div>
                        </div>
                      </label>
                      <RelationshipSelector
                        fromEntity={entity}
                        className="mt-1"
                        type="parent"
                        relationship={relationship}
                        relatedRows={relatedRows}
                        onFindEntityRows={onFindEntityRows}
                        allEntities={allEntities}
                        onRemoveRelatedRow={onRemoveRelatedRow}
                        readOnly={item?.id !== undefined && (!editing || !canUpdate)}
                        routes={routes}
                        relationshipRows={relationshipRows}
                        addRelationshipRow={addRelationshipRow}
                        setRelationshipRows={setRelationshipRows}
                      />
                    </div>
                  ))}

                  {isAddingOrEditing && (
                    <AddHiddenRelationshipEntities items={parentEntities.hidden} onClick={parentEntities.onAddParentEntity} type="parent" />
                  )}
                </>
              )}
              {/* Show custom properties in Default Properties Group */}
              {!group && <>{children}</>}
            </div>
          </InputGroup>
        );
      })}
    </>
  );
}

function AddHiddenRelationshipEntities({
  items,
  onClick,
  type,
}: {
  items: EntityRelationshipWithDetailsDto[];
  onClick: (item: EntityRelationshipWithDetailsDto) => void;
  type: "parent" | "child";
}) {
  const { t } = useTranslation();
  return (
    <Fragment>
      {items.length > 0 && (
        <div className="col-span-12 flex flex-wrap items-center">
          {items.map((relationship) => (
            <button
              key={relationship.id}
              type="button"
              onClick={() => onClick(relationship)}
              className="m-0.5 w-auto rounded-md bg-secondary/90 px-2 py-1 text-xs font-medium text-muted-foreground hover:bg-gray-200"
            >
              {t("shared.add")} {type === "parent" ? t(relationship.parent.title) : t(relationship.child.title)}
            </button>
          ))}
        </div>
      )}
    </Fragment>
  );
}

function getVisibleRelatedEntities(
  entityRelationships: EntityRelationshipWithDetailsDto[],
  relatedRows: { relationship: EntityRelationshipWithDetailsDto; rows: RowWithValuesDto[] }[]
) {
  const visible = entityRelationships.filter((f) => !f.hiddenIfEmpty);
  const hidden: EntityRelationshipWithDetailsDto[] = [];

  entityRelationships
    .filter((f) => f.hiddenIfEmpty)
    .forEach((relationship) => {
      const rows = relatedRows.filter((f) => f.relationship.id === relationship.id).flatMap((f) => f.rows);
      if (rows.length > 0) {
        visible.push(relationship);
      } else {
        hidden.push(relationship);
      }
    });

  return {
    visible,
    hidden,
  };
}

export default forwardRef(RowForm);
