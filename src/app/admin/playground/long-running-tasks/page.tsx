"use client";

import { useEffect, useState } from "react";
import { Colors } from "@/lib/enums/shared/Colors";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import InfoBanner from "@/components/ui/banners/InfoBanner";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import TableSimple from "@/components/ui/tables/TableSimple";

const TOTAL_ITEMS = 100;
const MILLISECONDS_PER_ITEM = 300;
const BLOCK_SIZE = 10;

type NextActionDto = {
  action: string;
  from?: number;
  to?: number;
  total?: number;
};
type ActionData = {
  next?: NextActionDto;
  success?: string;
  error?: string;
  items?: ItemToImportDto[];
};

type ItemToImportDto = {
  id: string;
  name: string;
  processed: boolean;
};
export default function LongRunningTasksPage() {
  const [actionData, setActionData] = useState<ActionData>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [status, setStatus] = useState<{ error?: string; loading?: string; success?: string }>();

  const [items, setItems] = useState<ItemToImportDto[]>([]);

  const submitAction = async (formData: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/playground/long-running-tasks", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setActionData(data);
    } catch (error) {
      setActionData({ error: error instanceof Error ? error.message : "An error occurred" });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const items: ItemToImportDto[] = [];
    for (let idx = 0; idx < TOTAL_ITEMS; idx++) {
      items.push({ id: `temp-${idx}`, name: `Item ${idx + 1}`, processed: false });
    }
    setItems(items);
  }, []);

  useEffect(() => {
    if (actionData?.items && actionData?.items.length > 0) {
      setItems(actionData.items);
    }

    if (actionData?.success) {
      setStatus({ success: actionData.success });
    } else if (actionData?.error) {
      setStatus({ error: actionData.error });
    } else if (actionData?.next?.action === "import") {
      setStatus({ loading: `Importing ${actionData.next.from}-${actionData.next.to}/${actionData.next.total}...` });
      const form = new FormData();
      form.set("action", "import");
      form.set("from", actionData?.next.from?.toString() ?? "");
      form.set("to", actionData?.next.to?.toString() ?? "");
      form.set("total", actionData?.next.total?.toString() ?? "");
      (actionData.items ?? items).forEach((item: ItemToImportDto) => {
        form.append("items[]", JSON.stringify(item));
      });
      submitAction(form);
    } else if (actionData?.next?.action === "process") {
      setStatus({ loading: "Processing..." });
      const formData = new FormData();
      formData.set("action", "process");
      (actionData.items ?? items).forEach((item: ItemToImportDto) => {
        formData.append("items[]", JSON.stringify(item));
      });
      submitAction(formData);
    } else {
      setStatus(undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actionData]);

  function onSubmit() {
    setStatus({ loading: `Importing 0-${BLOCK_SIZE}/${items.length}...` });

    const form = new FormData();
    form.append("action", "import");
    form.append("from", "0");
    form.append("to", BLOCK_SIZE.toString());
    form.append("total", items.length.toString());
    items.forEach((item) => {
      form.append("items[]", JSON.stringify(item));
    });
    submitAction(form);
  }
  return (
    <div className="space-y-2 p-4">
      <div className="space-y-1">
        <h1 className="font-bold text-foreground">Long Running Task</h1>
        <p className="text-foreground/80">Simulate a long running task that is executed in the background.</p>
      </div>

      <div className="space-y-2">
        <WarningBanner
          title="Note"
          text={`This process simulates importing ${TOTAL_ITEMS} records (${MILLISECONDS_PER_ITEM} milliseconds each) in batches of ${BLOCK_SIZE}, and then processing them.`}
        />

        <div>
          <ButtonPrimary disabled={isSubmitting} onClick={onSubmit}>
            {status?.loading ?? <span>Import {items.length} records</span>}
          </ButtonPrimary>
        </div>

        {actionData?.success ? (
          <InfoBanner title="Success" text={actionData.success} />
        ) : actionData?.error ? (
          <ErrorBanner title="Error" text={actionData.error} />
        ) : null}

        {/* {items.map((item, idx) => {
          return <input key={idx} type="hidden" readOnly hidden name="items[]" value={JSON.stringify(item)} />;
        })} */}

        <TableSimple
          items={items}
          headers={[
            {
              name: "name",
              title: "Name",
              className: "w-full",
              value: (item) => (
                <div className="flex flex-col">
                  <div>{item.name}</div>
                  {item.id ? <div className="text-xs text-muted-foreground">ID: {item.id}</div> : null}
                </div>
              ),
            },
            {
              name: "imported",
              title: "Imported",
              value: (item) => (item.id ? <SimpleBadge color={Colors.GREEN}>Imported</SimpleBadge> : <SimpleBadge color={Colors.YELLOW}>Pending</SimpleBadge>),
            },
            {
              name: "processed",
              title: "Processed",
              value: (item) =>
                item.processed ? <SimpleBadge color={Colors.GREEN}>Processed</SimpleBadge> : <SimpleBadge color={Colors.YELLOW}>Pending</SimpleBadge>,
            },
          ]}
        />
      </div>
    </div>
  );
}
