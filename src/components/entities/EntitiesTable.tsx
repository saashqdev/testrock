"use client";

import { useTranslation } from "react-i18next";
import Link from "next/link";
import { EntityWithCountDto } from "@/db/models/entityBuilder/EntitiesModel";
import SimpleBadge from "../ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import TableSimple from "../ui/tables/TableSimple";
import RelationshipHelper from "@/lib/helpers/RelationshipHelper";
import OrderListButtons from "../ui/sort/OrderListButtons";
import { useEffect, useState } from "react";
import type { RowHeaderDisplayDto as TableRowHeaderDisplayDto } from "../ui/tables/TableSimple";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { setEntityOrders } from "@/app/admin/entities/actions";
import { useRouter } from "next/navigation";

interface Props {
  items: EntityWithCountDto[];
  selected?: EntityWithCountDto[];
  onSelected?: (items: EntityWithCountDto[]) => void;
}

export default function EntitiesTable({ items, selected, onSelected }: Props) {
  const appOrAdminData = useAppOrAdminData();
  const { t } = useTranslation();
  const router = useRouter();

  const [localItems, setLocalItems] = useState<EntityWithCountDto[]>(items);
  const [headers, setHeaders] = useState<TableRowHeaderDisplayDto<EntityWithCountDto>[]>([]);
  
  // Update local items when props change
  useEffect(() => {
    setLocalItems(items);
  }, [items]);
  
  const handleOrderChange = (newItems: Array<{ id: string; order: number }>) => {
    // Cast back to EntityWithCountDto[]
    const updatedItems = newItems as EntityWithCountDto[];
    
    // Optimistic update
    setLocalItems(updatedItems);
    
    // Persist to server
    const formData = new FormData();
    formData.set("action", "set-orders");
    updatedItems.forEach((item) => {
      formData.append("orders[]", JSON.stringify({ id: item.id, order: item.order.toString() }));
    });
    
    setEntityOrders(formData)
      .then(() => {
        // Refresh the page data
        router.refresh();
      })
      .catch((error) => {
        // Revert on error
        setLocalItems(items);
        console.error("Failed to update entity order:", error);
      });
  };

  useEffect(() => {
    const headers: TableRowHeaderDisplayDto<EntityWithCountDto>[] = [
      {
        name: "type",
        title: t("models.entity.type"),
        value: (item) => (
          <SimpleBadge
            title={item.type === "all" ? "app-and-admin" : item.type}
            color={item.type === "app" ? Colors.BLUE : item.type === "admin" ? Colors.GRAY : Colors.EMERALD}
          />
        ),
      },
      {
        title: t("shared.order"),
        name: "order",
        value: (item) => item.order,
        formattedValue: (_, idx) => <OrderListButtons index={idx} items={localItems} onChange={handleOrderChange} />,
      },
      {
        name: "title",
        title: t("models.entity.title"),
        value: (item) => (
          <div className="flex items-center space-x-1">
            <Link href={"/admin/entities/" + item.slug + "/details"} className="font-medium hover:underline">
              {t(item.titlePlural)}
            </Link>
          </div>
        ),
      },
      {
        name: "properties",
        title: t("models.property.plural"),
        className: "w-full text-xs",
        value: (item) => (
          <div className="max-w-xs truncate">
            {item.properties.filter((f) => !f.isDefault).length > 0 ? (
              <Link className="truncate pb-1 hover:underline" href={"/admin/entities/" + item.slug + "/properties"}>
                {item.properties
                  .filter((f) => !f.isDefault)
                  .map((f) => t(f.title) + (f.isRequired ? "*" : ""))
                  .join(", ")}
              </Link>
            ) : (
              <Link className="truncate pb-1 text-muted-foreground hover:underline" href={"/admin/entities/" + item.slug + "/properties"}>
                {t("shared.setCustomProperties")}
              </Link>
            )}
          </div>
        ),
      },
      {
        name: "relationships",
        title: t("models.relationship.plural"),
        value: (item) => (
          <Link className="truncate pb-1 hover:underline" href={"/admin/entities/" + item.slug + "/relationships"}>
            {[...item.parentEntities, ...item.childEntities]
              .map((relationship) => t(RelationshipHelper.getTitleWithName({ fromEntityId: item.id, relationship })))
              .join(", ")}
          </Link>
        ),
        className: "text-xs",
      },
      {
        name: "rows",
        title: t("models.row.plural"),
        value: (item) => (
          <Link href={"/admin/entities/" + item.slug + "/rows"} className="hover:underline">
            {item._count.rows}
          </Link>
        ),
      },
    ];

    setHeaders(headers);
  }, [appOrAdminData?.tenantTypes, localItems, t]);

  return (
    <div className="space-y-2">
      <TableSimple
        selectedRows={selected}
        onSelected={onSelected}
        items={localItems}
        actions={[
          {
            title: "No-code",
            onClickRoute: (_, item) => `/admin/entities/${item.slug}/no-code`,
            disabled: (i) => !i.isAutogenerated,
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => `/admin/entities/${item.slug}/details`,
          },
        ]}
        headers={headers}
      />
    </div>
  );
}
