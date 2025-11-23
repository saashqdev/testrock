"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useTranslation } from "react-i18next";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import DateCell from "@/components/ui/dates/DateCell";
import ExternalLinkEmptyIcon from "@/components/ui/icons/ExternalLinkEmptyIcon";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import TableSimple from "@/components/ui/tables/TableSimple";
import FakeProjectOverview from "@/modules/fake/fakeProjectsCrud/components/FakeProjectOverview";
import { Colors } from "@/lib/enums/shared/Colors";
import { FakeProjectDto } from "@/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import { completeTask } from "./actions";

type FakeProjectsClientProps = {
  initialData: {
    items: FakeProjectDto[];
    pagination: PaginationDto;
    overviewItem: FakeProjectDto | null;
  };
};

export default function FakeProjectsClient({ initialData }: FakeProjectsClientProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [overviewItem, setOverviewItem] = useState<FakeProjectDto | undefined>(initialData.overviewItem ?? undefined);
  const [actionData, setActionData] = useState<{ success?: string; error?: string }>();

  useEffect(() => {
    setOverviewItem(initialData.overviewItem ?? undefined);
  }, [initialData.overviewItem]);

  const updateSearchParams = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    if (!overviewItem) return;

    try {
      const result = await completeTask(overviewItem.id, taskId);
      setActionData(result);
      if (result.success) {
        // Refresh the data
        router.refresh();
      }
    } catch (error) {
      setActionData({ error: "An error occurred" });
    }
  };

  return (
    <IndexPageLayout
      title="Fake Projects"
      buttons={
        <>
          <ButtonSecondary
            to="."
            disabled={isPending}
            onClick={() => {
              startTransition(() => {
                router.refresh();
              });
            }}
          >
            {t("shared.reload")}
          </ButtonSecondary>
          <ButtonPrimary to="new" disabled={isPending}>
            {t("shared.new")}
          </ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={initialData.items}
        pagination={initialData.pagination}
        actions={[
          {
            title: t("shared.overview"),
            onClick: (_, item) => {
              updateSearchParams("id", item.id);
            },
          },
          {
            title: t("shared.edit"),
            onClickRoute: (_, item) => `${item.id}`,
          },
        ]}
        headers={[
          {
            name: "name",
            title: "Name",
            className: "w-full",
            value: (item) => (
              <div className="max-w-sm truncate">
                <Link href={`${item.id}`} className="hover:underline">
                  <div className="flex flex-col truncate">
                    <div className="truncate">{item.name}</div>
                    <div className="truncate text-xs text-muted-foreground">{item.description}</div>
                  </div>
                </Link>
              </div>
            ),
          },
          {
            name: "active",
            title: "Active",
            value: (item) => (item.active ? <SimpleBadge title="Active" color={Colors.GREEN} /> : <SimpleBadge title="Archived" color={Colors.GRAY} />),
          },
          {
            name: "tasks",
            title: "Tasks",
            value: (item) => (
              <div>
                {item.tasks.filter((f) => f.completed).length}/{item.tasks.length} completed
              </div>
            ),
          },
          {
            name: "date",
            title: "Created at",
            value: (item) => <DateCell displays={["ymd"]} date={item.createdAt} />,
          },
        ]}
      />
      <SlideOverWideEmpty
        title={"Fake Projects"}
        open={!!searchParams.get("id")?.toString()}
        onClose={() => {
          updateSearchParams("id", null);
          setTimeout(() => {
            setOverviewItem(undefined);
          }, 100);
        }}
        size="2xl"
        buttons={
          <>
            <Link
              href={`${overviewItem?.id}`}
              className="focus:outline-hidden rounded-md bg-background text-muted-foreground hover:text-muted-foreground focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close panel</span>
              <ExternalLinkEmptyIcon className="h-6 w-6" aria-hidden="true" />
            </Link>
          </>
        }
      >
        {!overviewItem ? (
          <div>{t("shared.loading")}...</div>
        ) : (
          <FakeProjectOverview
            item={overviewItem}
            actionData={actionData}
            onCompleteTask={(task) => {
              handleCompleteTask(task.id);
            }}
          />
        )}
      </SlideOverWideEmpty>
    </IndexPageLayout>
  );
}
