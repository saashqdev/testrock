"use client";

import { Menu } from "@headlessui/react";
import clsx from "clsx";
import { Fragment } from "react";
import { useTranslation } from "react-i18next";
import { SubscriptionFeatureDto } from "@/lib/dtos/subscriptions/SubscriptionFeatureDto";
import { SubscriptionProductDto } from "@/lib/dtos/subscriptions/SubscriptionProductDto";
import { InputType } from "@/lib/enums/shared/InputType";
import { SubscriptionFeatureLimitType } from "@/lib/enums/subscriptions/SubscriptionFeatureLimitType";
import Dropdown from "@/components/ui/dropdowns/Dropdown";
import DocumentDuplicateIcon from "@/components/ui/icons/DocumentDuplicateIcon";
import TrashEmptyIcon from "@/components/ui/icons/TrashEmptyIcon";
import TableSimple from "@/components/ui/tables/TableSimple";
import { updateItemByIdx } from "@/lib/shared/ObjectUtils";

interface Props {
  plans: SubscriptionProductDto[] | undefined;
  items: SubscriptionFeatureDto[];
  setItems: React.Dispatch<React.SetStateAction<SubscriptionFeatureDto[]>>;
}

type SubscriptionFeatureWithId = SubscriptionFeatureDto & { id: string };

export default function PricingFeaturesTable({ plans, items, setItems }: Props) {
  const { t } = useTranslation();
  
  // Ensure all items have IDs
  const itemsWithIds: SubscriptionFeatureWithId[] = items.map(item => item.id ? item as SubscriptionFeatureWithId : { ...item, id: crypto.randomUUID() });
  
  function onAddFeature() {
    const order = itemsWithIds.length === 0 ? 1 : Math.max(...itemsWithIds.map((o) => o.order)) + 1;
    setItems([
      ...itemsWithIds,
      {
        id: crypto.randomUUID(),
        order,
        title: "",
        name: "",
        type: SubscriptionFeatureLimitType.NOT_INCLUDED,
        value: 0,
        accumulate: false,
      },
    ]);
  }

  function changeOrder(item: SubscriptionFeatureWithId, index: number, direction: "up" | "down") {
    const newItems = [...itemsWithIds];
    const newIndex = direction === "up" ? index - 1 : index + 1;
    newItems.splice(index, 1);
    newItems.splice(newIndex, 0, item);
    for (let i = 0; i < newItems.length; i++) {
      newItems[i].order = i + 1;
    }
    setItems(newItems);
  }

  function isLastItem(index: number) {
    return index === itemsWithIds.length - 1;
  }

  return (
    <div className="space-y-2">
      <Buttons plans={plans} items={itemsWithIds} setItems={setItems} onAddFeature={onAddFeature} />
      <div className="">
        <TableSimple
          headers={[
            {
              title: "",
              name: "feature-order",
              className: "w-10",
              // value: (item) => item.order,
              // type: InputType.NUMBER,
              // setValue: (order, idx) =>
              //   updateItemByIdx(items, setItems, idx, {
              //     order,
              //   }),
              // inputBorderless: true,
              value: (item, index) => (
                <div className="w-10">
                  <div className="flex items-center space-x-1 truncate">
                    <button
                      title="Move up"
                      type="button"
                      onClick={() => changeOrder(item, index, "up")}
                      className={clsx(
                        index <= 0 ? "cursor-not-allowed bg-secondary/90 text-gray-300" : "hover:bg-secondary/90 hover:text-foreground",
                        "focus:outline-hidden h-4 w-4 bg-secondary px-0.5 py-0.5 text-muted-foreground"
                      )}
                      disabled={index <= 0}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                    <button
                      title="Move down"
                      type="button"
                      onClick={() => changeOrder(item, index, "down")}
                      className={clsx(
                        isLastItem(index) ? "cursor-not-allowed bg-secondary/90 text-gray-300" : "hover:bg-secondary/90 hover:text-foreground",
                        "focus:outline-hidden h-4 w-4 bg-secondary px-0.5 py-0.5 text-muted-foreground"
                      )}
                      disabled={isLastItem(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fillRule="evenodd"
                          d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ),
            },
            {
              title: t("shared.title"),
              name: "feature-title",
              className: "w-32",
              value: (item) => item.title,
              onChange: (title, idx) =>
                updateItemByIdx(itemsWithIds, setItems, idx, {
                  title,
                }),
              inputBorderless: true,
            },
            {
              title: t("shared.type"),
              name: "feature-type",
              type: "select",
              value: (item) => item.type,
              className: "w-32",
              options: [
                {
                  name: "Not included",
                  value: SubscriptionFeatureLimitType.NOT_INCLUDED,
                },
                {
                  name: "Included",
                  value: SubscriptionFeatureLimitType.INCLUDED,
                },
                {
                  name: "Monthly",
                  value: SubscriptionFeatureLimitType.MONTHLY,
                },
                {
                  name: "Max",
                  value: SubscriptionFeatureLimitType.MAX,
                },
                {
                  name: "Unlimited",
                  value: SubscriptionFeatureLimitType.UNLIMITED,
                },
              ],
              onChange: (type, idx) => {
                let value = itemsWithIds[idx].value;
                if (Number(type) !== SubscriptionFeatureLimitType.MAX && Number(type) !== SubscriptionFeatureLimitType.MONTHLY) {
                  value = 0;
                }
                updateItemByIdx(itemsWithIds, setItems, idx, {
                  type,
                  value,
                });
              },
              inputBorderless: true,
            },
            {
              title: t("shared.name"),
              name: "feature-name",
              className: "w-32",
              inputOptional: true,
              value: (item) => item.name,
              onChange: (name, idx) =>
                updateItemByIdx(itemsWithIds, setItems, idx, {
                  name,
                }),
              inputBorderless: true,
            },
            {
              title: "Value",
              name: "feature-value",
              type: "number",
              className: "w-32",
              value: (item) => item.value,
              editable: (item) => item.type === SubscriptionFeatureLimitType.MAX || item.type === SubscriptionFeatureLimitType.MONTHLY,
              onChange: (value, idx) =>
                updateItemByIdx(itemsWithIds, setItems, idx, {
                  value,
                }),
              inputBorderless: true,
            },
            {
              title: "Link",
              name: "feature-href",
              type: "text",
              className: "w-32",
              inputOptional: true,
              value: (item) => item.href,
              onChange: (href, idx) =>
                updateItemByIdx(itemsWithIds, setItems, idx, {
                  href,
                }),
              inputBorderless: true,
            },
            {
              title: "Badge",
              name: "feature-badge",
              type: "text",
              className: "w-32",
              inputOptional: true,
              value: (item) => item.badge,
              onChange: (badge, idx) =>
                updateItemByIdx(itemsWithIds, setItems, idx, {
                  badge,
                }),
              inputBorderless: true,
            },
          ]}
          items={itemsWithIds}
          actions={[
            {
              title: t("shared.delete"),
              onClick: (idx) => setItems(itemsWithIds.filter((_x, i) => i !== idx)),
            },
          ]}
        ></TableSimple>
        {itemsWithIds.map((item, idx) => {
          return (
            <div key={idx} className=" ">
              <input readOnly hidden type="text" id="features[]" name="features[]" value={JSON.stringify(item)} />
            </div>
          );
        })}
      </div>
      {itemsWithIds.length > 10 && <Buttons plans={plans} items={itemsWithIds} setItems={setItems} onAddFeature={onAddFeature} />}
    </div>
  );
}

function Buttons({
  plans,
  items,
  setItems,
  onAddFeature,
}: {
  plans: SubscriptionProductDto[] | undefined;
  items: SubscriptionFeatureDto[];
  setItems: React.Dispatch<React.SetStateAction<SubscriptionFeatureDto[]>>;
  onAddFeature: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center space-x-2">
      <button
        type="button"
        onClick={onAddFeature}
        className="focus:ring-3 mt-2 flex items-center space-x-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/90 focus:text-foreground focus:ring-gray-300 focus:ring-offset-1"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <span className="font-medium uppercase">{t("shared.add")}</span>
      </button>

      <Dropdown
        right={true}
        // onClick={() => alert("Dropdown click")}
        button={
          <Fragment>
            <DocumentDuplicateIcon className="h-4 w-4" />
            <span className="font-medium uppercase">Copy from product...</span>
          </Fragment>
        }
        btnClassName="mt-2 flex items-center space-x-1 rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground hover:bg-secondary/90 focus:text-foreground focus:ring-3 focus:ring-gray-300 focus:ring-offset-1"
        options={
          <div className="h-64 overflow-auto">
            {plans?.map((product, idx) => {
              return (
                <Menu.Item key={idx}>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => {
                        let uniqueFeatures = product.features.filter((feature) => !items.find((item) => item.name === feature.name));
                        const featuresWithIds = uniqueFeatures.map(f => ({ ...f, id: f.id || crypto.randomUUID() }));
                        setItems([...items, ...featuresWithIds]);
                      }}
                      className={clsx("w-full text-left", active ? "bg-secondary/90 text-foreground" : "text-foreground/80", "block px-4 py-2 text-sm")}
                    >
                      {t(product.title)} ({product.features.length})
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        }
      ></Dropdown>

      <button
        type="button"
        onClick={() => {
          setItems([]);
        }}
        disabled={items.length === 0}
        className={clsx(
          "focus:ring-3 mt-2 flex items-center space-x-1 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground focus:text-foreground focus:ring-gray-300 focus:ring-offset-1",
          items.length === 0 ? "cursor-not-allowed opacity-80" : "bg-background hover:bg-secondary/90"
        )}
      >
        <TrashEmptyIcon className="h-4 w-4" />
        <span className="font-medium uppercase">{t("shared.clear")}</span>
      </button>
    </div>
  );
}
