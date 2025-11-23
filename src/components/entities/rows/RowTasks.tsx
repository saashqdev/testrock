"use client";

import clsx from "clsx";
import { useEffect, useRef, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import CheckEmptyCircle from "@/components/ui/icons/CheckEmptyCircleIcon";
import CheckFilledCircleIcon from "@/components/ui/icons/CheckFilledCircleIcon";
import PlusIcon from "@/components/ui/icons/PlusIcon";
import TrashIcon from "@/components/ui/icons/TrashIcon";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { RowTaskWithDetailsDto } from "@/db/models/entityBuilder/RowTasksModel";

interface Props {
  items: RowTaskWithDetailsDto[];
}

export default function RowTasks({ items }: Props) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const appOrAdminData = useAppOrAdminData();

  const formRef = useRef<HTMLFormElement>(null);

  const [showAddTask, setShowAddTask] = useState(false);

  useEffect(() => {
    if (!isAdding) {
      formRef.current?.reset();
    }
  }, [isAdding]);

  async function handleFormSubmit(formData: FormData) {
    setIsAdding(true);
    startTransition(async () => {
      try {
        // Replace with your actual API endpoint
        await fetch("/api/tasks", {
          method: "POST",
          body: formData,
        });
        formRef.current?.reset();
        setShowAddTask(false);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setIsAdding(false);
      }
    });
  }

  function onToggleTaskCompleted(id: string) {
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("action", "task-complete-toggle");
        form.set("task-id", id);

        await fetch("/api/tasks", {
          method: "POST",
          body: form,
        });
      } catch (error) {
        console.error("Error toggling task:", error);
      }
    });
  }

  function onDeleteTask(id: string) {
    startTransition(async () => {
      try {
        const form = new FormData();
        form.set("action", "task-delete");
        form.set("task-id", id);

        await fetch("/api/tasks", {
          method: "POST",
          body: form,
        });
      } catch (error) {
        console.error("Error deleting task:", error);
      }
    });
  }

  function canDelete(item: RowTaskWithDetailsDto) {
    return appOrAdminData?.isSuperUser || (!item.completed && item.createdByUserId === appOrAdminData?.user?.id);
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h3 className="text-sm font-medium leading-3 text-foreground">
          <div className="flex items-center space-x-1">
            <CheckFilledCircleIcon className="h-4 w-4 text-muted-foreground" />
            <div>
              <span className="font-light italic"></span> {t("models.rowTask.plural")}
            </div>
          </div>
        </h3>
        {items.length > 0 && appOrAdminData?.user !== undefined && (
          <div className="inline text-xs">
            <button type="button" onClick={() => setShowAddTask(true)} className="flex items-center space-x-1 text-sm text-muted-foreground hover:underline">
              <PlusIcon className="h-3 w-3" />
              <div>{t("shared.addTask")}</div>
            </button>
          </div>
        )}
      </div>

      {items.length === 0 && !showAddTask && (
        <>
          {appOrAdminData?.user !== undefined ? (
            <button
              type="button"
              onClick={() => setShowAddTask(true)}
              className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-border focus:ring-2 focus:ring-gray-500"
            >
              <span className="block text-xs font-normal text-muted-foreground">{t("shared.noTasks")}</span>
            </button>
          ) : (
            <div className="relative block w-full rounded-lg border-2 border-dashed border-border p-4 text-center">
              <span className="block text-xs font-normal text-muted-foreground">{t("shared.noTasks")}</span>
            </div>
          )}
        </>
      )}

      {items.length > 0 && (
        <ul className="rounded-lg border-2 border-dashed border-border p-2">
          {items.map((item) => {
            return (
              <li key={item.id} className="inline py-2">
                {/* <Link href={"tasks/" + item.id} className="relative inline-flex items-center rounded-md border border-border px-3 py-0.5">
                <span className="text-sm leading-5 font-medium text-foreground">{item.title}</span>
              </Link>{" "} */}
                <div className="group flex items-center justify-between space-x-1 truncate">
                  <div className="flex grow items-center space-x-1 truncate">
                    <button
                      disabled={!appOrAdminData?.user || isPending}
                      type="button"
                      onClick={() => onToggleTaskCompleted(item.id)}
                      className="focus:outline-hidden shrink-0 text-muted-foreground hover:text-foreground/80 disabled:opacity-50"
                    >
                      {item.completed ? <CheckFilledCircleIcon className="h-5 w-5 text-teal-500" /> : <CheckEmptyCircle className="h-5 w-5" />}
                    </button>
                    <div className="truncate text-sm text-muted-foreground">{item.title}</div>
                  </div>
                  {canDelete(item) && (
                    <button
                      disabled={!canDelete(item) || !appOrAdminData?.user || isPending}
                      type="button"
                      onClick={() => onDeleteTask(item.id)}
                      className={clsx(
                        "focus:outline-hidden invisible shrink-0 text-muted-foreground hover:text-muted-foreground group-hover:visible",
                        (!canDelete(item) || isPending) && "cursor-not-allowed opacity-50"
                      )}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showAddTask && (
        <form
          ref={formRef}
          action={async (formData) => {
            await handleFormSubmit(formData);
          }}
        >
          <input hidden readOnly name="action" value="task-new" />
          <div className={clsx("relative flex w-full rounded-md")}>
            <input
              autoFocus
              type="text"
              className={clsx("block w-full min-w-0 flex-1 rounded-md border-border focus:border-border focus:ring-ring sm:text-sm")}
              name="task-title"
              placeholder={t("shared.newTask") + "..."}
              autoComplete="off"
              required
              disabled={isAdding}
            />
            <div className="absolute inset-y-0 right-0 flex py-1.5 pr-1.5">
              <kbd className="inline-flex items-center rounded border border-border bg-background px-1 font-sans text-sm font-medium text-muted-foreground">
                <button type="submit" disabled={isAdding || isPending}>
                  <PlusIcon className="h-4 w-4" />
                </button>
              </kbd>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
