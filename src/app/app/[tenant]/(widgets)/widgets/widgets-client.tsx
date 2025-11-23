"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import clsx from "clsx";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import DateCell from "@/components/ui/dates/DateCell";
import InputText from "@/components/ui/input/InputText";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import Modal from "@/components/ui/modals/Modal";
import TableSimple from "@/components/ui/tables/TableSimple";
import JsonPropertyValueCell from "@/modules/jsonProperties/components/JsonPropertyValueCell";
import JsonPropertyValuesInput from "@/modules/jsonProperties/components/JsonPropertyValuesInput";
import { WidgetDto } from "@/modules/widgets/dtos/WidgetDto";
import UrlUtils from "@/utils/app/UrlUtils";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";
import { LoaderData } from "./page";

interface WidgetsClientProps {
  data: LoaderData;
  appConfiguration: AppConfigurationDto;
}

export default function WidgetsClient({ data, appConfiguration }: WidgetsClientProps) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [addingWidget, setAddingWidget] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleCreateWidget = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      try {
        const response = await fetch(window.location.href, {
          method: "POST",
          body: formData,
        });

        const result = await response.json();

        if (!response.ok) {
          toast.error(result.error || "An error occurred");
        } else if (result.success) {
          if (result.redirectUrl) {
            router.push(result.redirectUrl);
          } else {
            toast.success(result.success);
            setAddingWidget(false);
            router.refresh(); // Refresh server data
          }
        }
      } catch (error: any) {
        toast.error(error.message);
      }
    });
  };

  return (
    <EditPageLayout
      title={t("widgets.plural")}
      buttons={
        <>
          <ButtonPrimary onClick={() => setAddingWidget(true)}>{t("shared.new")}</ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={data.items}
        actions={[
          {
            title: t("shared.edit"),
            onClickRoute(idx, item) {
              return UrlUtils.getModulePath(params, `widgets/${item.id}`);
            },
          },
        ]}
        headers={[
          {
            title: "Title",
            value: (item) => (
              <div>
                <Link href={UrlUtils.getModulePath(params, `widgets/${item.id}`)} className="font-medium hover:underline">
                  {item.name}
                </Link>
              </div>
            ),
          },
          ...(appConfiguration.widgets.metadata?.map((f) => ({
            name: f.name,
            title: f.title,
            value: (item: WidgetDto) => {
              return <JsonPropertyValueCell property={f} value={item.metadata ? item.metadata[f.name] : null} />;
            },
          })) || []),
          {
            title: t("widgets.appearance"),
            value: (item) => (
              <div>
                <ShowPayloadModalButton description="Appearance" payload={JSON.stringify(item.appearance)} />
              </div>
            ),
          },
          {
            title: t("shared.created"),
            value: (item) => <DateCell date={item.createdAt} />,
          },
        ]}
      ></TableSimple>

      <AddWidgetModal
        appConfiguration={appConfiguration}
        open={addingWidget}
        onClose={() => setAddingWidget(false)}
        onSubmit={handleCreateWidget}
        isPending={isPending}
      />
    </EditPageLayout>
  );
}

function AddWidgetModal({
  appConfiguration,
  open,
  onClose,
  onSubmit,
  isPending,
}: {
  appConfiguration: AppConfigurationDto;
  open: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  isPending: boolean;
}) {
  const { t } = useTranslation();
  const [state, setState] = useState({ name: "" });

  return (
    <Modal open={open} setOpen={onClose} size="md">
      <form onSubmit={onSubmit} className="inline-block w-full overflow-hidden bg-white p-1 text-left align-bottom sm:align-middle">
        <input type="hidden" name="action" value="create" readOnly hidden />
        <div className="mt-3 text-center sm:mt-5">
          <h3 className="text-lg font-medium leading-6 text-foreground">{t("widgets.create")}</h3>
        </div>
        <div className="mt-4 space-y-2">
          <InputText
            title={t("shared.name")}
            value={state.name}
            setValue={(e) => setState({ ...state, name: e.toString() })}
            type="text"
            name="name"
            id="name"
            placeholder={"Name"}
            required
            disabled={isPending}
          />
          <JsonPropertyValuesInput attributes={{}} prefix="metadata" properties={appConfiguration.widgets.metadata || []} />
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <button
            type="submit"
            disabled={isPending}
            className={clsx(
              "inline-flex w-full justify-center rounded-md border border-transparent px-4 py-2 text-base font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 sm:col-start-2 sm:text-sm",
              "bg-foreground text-background",
              isPending && "cursor-not-allowed opacity-50"
            )}
          >
            {isPending ? t("shared.creating") || "Creating..." : t("shared.create")}
          </button>
          <button
            type="button"
            disabled={isPending}
            className="mt-3 inline-flex w-full justify-center rounded-md border border-border bg-white px-4 py-2 text-base font-medium text-muted-foreground shadow-sm hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 sm:col-start-1 sm:mt-0 sm:text-sm"
            onClick={onClose}
          >
            {t("shared.back")}
          </button>
        </div>
      </form>
    </Modal>
  );
}
