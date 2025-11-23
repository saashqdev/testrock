"use client";

import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import CheckIcon from "@/components/ui/icons/CheckIcon";
import XIcon from "@/components/ui/icons/XIcon";
import TableSimple from "@/components/ui/tables/TableSimple";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowTaskWithDetailsDto } from "@/db/models/entityBuilder/RowTasksModel";
import RowHelper from "@/lib/helpers/RowHelper";
import DateUtils from "@/lib/shared/DateUtils";

type LoaderData = {
  tasks: RowTaskWithDetailsDto[];
  allEntities: EntityWithDetailsDto[];
};

export default function TasksPage() {
  const { t } = useTranslation();
  const [data, setData] = useState<LoaderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const response = await fetch("/api/admin/tasks");
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Failed to load tasks:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="space-y-5 p-8">
      <div className="flex items-center justify-between space-x-2">
        <h3 className="grow text-lg font-medium leading-6 text-foreground">{t("models.rowTask.plural")}</h3>
      </div>
      <TableSimple
        items={data.tasks}
        headers={[
          {
            name: "row",
            title: t("models.row.object"),
            value: (i) => <TaskRow allEntities={data.allEntities} task={i} />,
          },
          {
            name: "task",
            title: t("models.rowTask.object"),
            value: (i) => <div className="w-full">{i.title}</div>,
            className: "w-full",
          },
          {
            name: "completed",
            title: t("models.rowTask.completed"),
            value: (i) => (
              <div>{i.completed ? <CheckIcon className="h-4 w-4 text-muted-foreground" /> : <XIcon className="h-4 w-4 text-muted-foreground" />}</div>
            ),
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-muted-foreground text-xs",
            breakpoint: "sm",
            sortable: true,
          },
        ]}
      />
    </div>
  );
}

function TaskRow({ allEntities, task }: { allEntities: EntityWithDetailsDto[]; task: RowTaskWithDetailsDto }) {
  const { t } = useTranslation();
  const [entity] = useState(allEntities.find((f) => f.id === task.row.entityId));
  return <div>{entity && RowHelper.getTextDescription({ entity, item: task.row, t })}</div>;
}
