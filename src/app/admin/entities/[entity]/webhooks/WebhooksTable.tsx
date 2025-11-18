"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import TableSimple from "@/components/ui/tables/TableSimple";
import { EntityWebhookWithDetailsDto } from "@/db/models/entityBuilder/EntityWebhooksModel";
import { RowHeaderDisplayDto } from "@/lib/dtos/data/RowHeaderDisplayDto";
import { RowHeaderActionDto } from "@/components/ui/tables/TableSimple";
import Modal from "@/components/ui/modals/Modal";
import EntityWebhookForm from "@/components/entities/webhooks/EntityWebhookForm";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";

interface Props {
  items: EntityWebhookWithDetailsDto[];
  withActions?: boolean;
  showAddButton?: boolean;
}

export default function WebhooksTable({ items, withActions = false, showAddButton = false }: Props) {
  const { t } = useTranslation();
  const [headers, setHeaders] = useState<RowHeaderDisplayDto<EntityWebhookWithDetailsDto>[]>([]);
  const [editingItem, setEditingItem] = useState<EntityWebhookWithDetailsDto | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    const headers: RowHeaderDisplayDto<EntityWebhookWithDetailsDto>[] = [
      {
        title: "Action",
        name: "action",
        value: (item) => item.action,
      },
      {
        title: "Method",
        name: "method",
        value: (item) => item.method,
      },
      {
        title: "Endpoint",
        name: "endpoint",
        className: withActions ? "w-full" : "",
        value: (item) => item.endpoint,
      },
    ];

    if (withActions) {
      headers.push({
        title: "Logs",
        name: "logs",
        className: "w-full",
        value: (item) => item._count.logs,
      });
    }

    setHeaders(headers);
  }, [t, withActions]);

  const actions: RowHeaderActionDto<EntityWebhookWithDetailsDto>[] = withActions
    ? [
        {
          title: t("shared.edit"),
          onClick: (idx, item) => setEditingItem(item),
        },
      ]
    : [];

  return (
    <>
      <TableSimple headers={headers} items={items} actions={actions} />
      
      {showAddButton && (
        <div className="flex justify-start">
          <ButtonTertiary onClick={() => setShowAddModal(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium uppercase">{t("shared.add")}</span>
          </ButtonTertiary>
        </div>
      )}
      
      {editingItem && (
        <Modal className="sm:max-w-sm" open={true} setOpen={() => setEditingItem(null)}>
          <EntityWebhookForm item={editingItem} />
        </Modal>
      )}
      
      {showAddModal && (
        <Modal className="sm:max-w-sm" open={true} setOpen={() => setShowAddModal(false)}>
          <EntityWebhookForm />
        </Modal>
      )}
    </>
  );
}
