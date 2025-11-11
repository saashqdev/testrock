"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { RowHeaderDisplayDto } from "@/components/ui/tables/TableSimple";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PermissionsWithRolesDto } from "@/db/models/permissions/PermissionsModel";
import RoleBadge from "./RoleBadge";
import OrderListButtons from "@/components/ui/sort/OrderListButtons";

interface Props {
  items: PermissionsWithRolesDto[];
  className?: string;
  canCreate: boolean;
  canUpdate: boolean;
  tenantId?: string | null;
  canReorder?: boolean;
}

export default function PermissionsTable({ items, className, canCreate, canUpdate = true, tenantId, canReorder }: Props) {
  const { t } = useTranslation();

  const [actions, setActions] = useState<any[]>([]);
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<PermissionsWithRolesDto>[]>([]);

  useEffect(() => {
    if (canUpdate) {
      setActions([
        {
          title: t("shared.edit"),
          onClickRoute: (_: any, item: any) => item.id,
        },
      ]);
    }

    const headers: RowHeaderDisplayDto<PermissionsWithRolesDto>[] = [
      {
        name: "name",
        title: t("models.permission.name"),
        value: (i) => i.name,
        formattedValue: (i) => <RoleBadge item={i} />,
        className: "max-w-xs truncate",
      },
      {
        name: "description",
        title: t("models.permission.description"),
        value: (i) => i.description,
        className: "max-w-xs truncate",
      },
      {
        name: "roles",
        title: t("models.permission.inRoles"),
        value: (i) => i.inRoles.length,
        formattedValue: (i) => (
          <div className="w-64 truncate">
            <span className="max-w-sm truncate text-sm italic">
              {i.inRoles
                .sort((a, b) => a.role.order - b.role.order)
                .map((f) => f.role.name)
                .join(", ")}
            </span>
          </div>
        ),
        className: canUpdate ? "max-w-xs truncate" : "",
      },
    ];

    if (canReorder) {
      headers.unshift({
        name: "order",
        title: t("shared.order"),
        value: (_item, idx) => (
          <div>
            {_item.order}
            <OrderListButtons index={idx} items={items.map((f) => ({ ...f, order: f.order ?? 0 }))} editable={true} />
          </div>
        ),
      });
    }

    setHeaders(headers);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canUpdate]);

  return (
    <div>
      <TableSimple actions={actions} headers={headers} items={items} />
    </div>
  );
}
