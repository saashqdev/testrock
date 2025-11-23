"use client";

import { PropertiesModel } from "@/db/models/entityBuilder/PropertiesModel";
import clsx from "clsx";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import EntityHelper from "@/lib/helpers/EntityHelper";
import ButtonTertiary from "../../ui/buttons/ButtonTertiary";
import LockClosedIcon from "../../ui/icons/LockClosedIcon";
import NewFieldIcon from "../../ui/icons/NewFieldIcon";
import PencilIcon from "../../ui/icons/PencilIcon";
import TrashIcon from "../../ui/icons/TrashIcon";
import ConfirmModal, { RefConfirmModal } from "../../ui/modals/ConfirmModal";
import PropertyBadge from "./PropertyBadge";
import OrderListButtons from "../../ui/sort/OrderListButtons";
import EyeIcon from "@/components/ui/icons/EyeIcon";
import EyeLashIcon from "@/components/ui/icons/EyeLashIcon";
import DocumentDuplicateIconFilled from "@/components/ui/icons/DocumentDuplicateIconFilled";

interface Props {
  tenantId: string | null;
  items: PropertyWithDetailsDto[];
  className?: string;
}

export default function TenantPropertiesList({ tenantId, items, className }: Props) {
  const { t } = useTranslation();
  const router = useRouter();

  const confirmDelete = useRef<RefConfirmModal>(null);

  const [showDefaultFields, setShowDefaultFields] = useState(false);

  async function submitAction(action: string, id: string) {
    const formData = new FormData();
    formData.set("action", action);
    formData.set("id", id);

    try {
      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  }

  function deleteField(item: PropertiesModel) {
    confirmDelete.current?.setValue(item);
    confirmDelete.current?.show(t("shared.confirmDelete"), t("shared.delete"), t("shared.cancel"), t("shared.warningCannotUndo"));
  }

  function confirmedDelete(item: PropertiesModel) {
    submitAction("delete", item.id);
  }

  function onToggleDisplay(item: PropertiesModel) {
    submitAction("toggle-display", item.id);
  }

  function onDuplicate(item: PropertiesModel) {
    submitAction("duplicate", item.id);
  }

  return (
    <div className={clsx(className, "")}>
      <div className="space-y-2">
        {showDefaultFields && (
          <div className="mb-3 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">{t("models.property.defaultProperties.title")}</h3>
              {showDefaultFields && (
                <div className="flex justify-end">
                  <ButtonTertiary className="-my-1" onClick={() => setShowDefaultFields(!showDefaultFields)}>
                    {t("models.property.defaultProperties.hide")}
                  </ButtonTertiary>
                </div>
              )}
            </div>
            {items
              .filter((f) => f.tenantId === null)
              .map((item, idx) => {
                return (
                  <div key={idx} className="shadow-2xs rounded-md border border-border bg-secondary/90 px-4 py-2">
                    <div className="flex items-center justify-between space-x-2">
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <LockClosedIcon className="h-4 w-4 text-gray-300" />
                            {/* <PropertyBadge className="h-4 w-4 text-muted-foreground" /> */}
                            {/* <div className="truncate text-sm text-muted-foreground">{t("entities.fields." + PropertyType[item.type])}</div> */}
                          </div>

                          <div className="text-sm text-muted-foreground">
                            {/* <PropertyTitle item={item} /> */}
                            <div className="flex flex-col">
                              <div>{t(item.title)}</div>
                              <div className="text-xs text-muted-foreground">{item.name}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
      <div className="">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">{t("models.property.plural")}</h3>
            {!showDefaultFields && (
              <div className="flex justify-end">
                <ButtonTertiary className="-my-1" onClick={() => setShowDefaultFields(!showDefaultFields)}>
                  {t("models.property.defaultProperties.show")}
                </ButtonTertiary>
              </div>
            )}
          </div>

          {items
            .filter((f) => !f.isDefault && f.tenantId === tenantId)
            .sort((a, b) => a.order - b.order)
            .map((item, idx) => {
              return (
                <div key={idx} className="shadow-2xs rounded-md border border-border bg-background px-4 py-1">
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-2 truncate">
                      <div className="flex items-center space-x-3 truncate">
                        <div className="hidden shrink-0 sm:flex">
                          <OrderListButtons index={idx} items={items.filter((f) => !f.isDefault)} editable={true} />
                        </div>
                        <div className="flex items-center space-x-2">
                          <PropertyBadge type={item.type} className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex items-center space-x-2 truncate text-sm text-foreground">
                          <PropertyTitle item={item} />
                        </div>
                      </div>
                    </div>

                    <div className="flex shrink-0 space-x-1">
                      <div className="flex items-center space-x-1 truncate p-1">
                        <button
                          type="button"
                          onClick={() => onToggleDisplay(item)}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          {item.isDisplay ? (
                            <EyeIcon className="h-4 w-4 text-muted-foreground hover:text-muted-foreground" />
                          ) : (
                            <EyeLashIcon className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                          )}
                        </button>
                        <Link
                          href={item.id}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                          // onClick={() => update(idx, item)}
                        >
                          <PencilIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDuplicate(item)}
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                        >
                          <DocumentDuplicateIconFilled className="h-4 w-4 text-gray-300 hover:text-muted-foreground" />
                        </button>
                        <button
                          type="button"
                          className="focus:outline-hidden group flex items-center rounded-md border border-transparent p-2 hover:bg-secondary/90 focus:bg-secondary/90 focus:ring-2 focus:ring-gray-400 focus:ring-offset-1"
                          onClick={() => deleteField(item)}
                        >
                          <TrashIcon className="h-4 w-4 text-gray-300 group-hover:text-muted-foreground" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>
      </div>
      <div className="mt-3">
        <Link
          href={`new`}
          className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border px-12 py-6 text-center hover:border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
        >
          <NewFieldIcon className="mx-auto h-8 text-muted-foreground" />
          <span className="mt-2 block text-sm font-medium text-foreground">{t("models.property.actions.add")}</span>
        </Link>
      </div>
      {/* <PropertyForm ref={propertyForm} entityId={entityId} onCreated={created} onUpdated={updated} onDeleted={deleted} /> */}
      <ConfirmModal ref={confirmDelete} destructive onYes={confirmedDelete} />
    </div>
  );
}

const PropertyTitle = ({ item }: { item: PropertyWithDetailsDto }) => {
  const { t } = useTranslation();
  return (
    <>
      <div className="flex items-baseline space-x-1 truncate">
        <div className="flex flex-col">
          <div>
            {t(EntityHelper.getFieldTitle(item, item.isDefault))}
            {item.isRequired && <span className="text-red-500">*</span>}
          </div>
          <div className="text-xs text-muted-foreground">
            {item.name}
            {item.subtype === "phone" && " (phone)"}
            {item.subtype === "url" && " (URL)"}
            {[PropertyType.MULTI_SELECT, PropertyType.SELECT].includes(item.type) && "[]"}
            {[PropertyType.RANGE_NUMBER, PropertyType.RANGE_DATE].includes(item.type) && " (range)"}
            {[PropertyType.FORMULA].includes(item.type) && ` (formula)`}
          </div>
        </div>
        {/* {item.type === PropertyType.FORMULA && <div className="truncate italic text-muted-foreground">({item.formula})</div>} */}
        {[PropertyType.SELECT, PropertyType.MULTI_SELECT].includes(item.type) && (
          <div className="truncate text-xs text-muted-foreground">
            [{item.options.length === 0 ? "No options" : "Options: " + item.options?.map((f) => f.value).join(", ")}]
          </div>
        )}

        {item.attributes.filter((f) => f.value).length > 0 && (
          <div className="truncate text-xs text-muted-foreground">
            [
            {item.attributes
              .filter((f) => f.value)
              .map((f) => `${f.name}: ${f.value}`)
              .join(", ")}
            ]
          </div>
        )}
      </div>
    </>
  );
};
