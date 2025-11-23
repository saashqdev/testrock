"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import { Blacklist } from "@prisma/client";
import TableSimple from "@/components/ui/tables/TableSimple";
import { PaginationDto } from "@/lib/dtos/data/PaginationDto";
import InputText from "@/components/ui/input/InputText";
import DateUtils from "@/lib/shared/DateUtils";
import { useRef, useState, useTransition } from "react";
import ButtonPrimary from "@/components/ui/buttons/ButtonPrimary";
import SimpleBadge from "@/components/ui/badges/SimpleBadge";
import { Colors } from "@/lib/enums/shared/Colors";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import InputSelect from "@/components/ui/input/InputSelect";
import Modal from "@/components/ui/modals/Modal";
import { createBlacklistEntry, deleteBlacklistEntry } from "./actions";

interface ComponentProps {
  items: Blacklist[];
  pagination: PaginationDto;
}

export default function Component({ items, pagination }: ComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  const [adding, setAdding] = useState(false);
  const [type, setType] = useState("email");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createBlacklistEntry(formData);
      if (!result.error) {
        formRef.current?.reset();
        setAdding(false);
        setType("email");
        router.refresh();
      }
      setIsSubmitting(false);
    });
  }

  async function onDelete(item: Blacklist) {
    setIsSubmitting(true);

    startTransition(async () => {
      await deleteBlacklistEntry(item.type, item.value);
      router.refresh();
      setIsSubmitting(false);
    });
  }

  function getColor(type: string) {
    switch (type) {
      case "email":
        return Colors.TEAL;
      case "domain":
        return Colors.INDIGO;
      case "ip":
        return Colors.RED;
      default:
        return Colors.GRAY;
    }
  }

  return (
    <EditPageLayout
      title={t("models.blacklist.object")}
      buttons={
        <>
          <ButtonPrimary disabled={isSubmitting || isPending} onClick={() => setAdding(true)}>
            {t("shared.new")}
          </ButtonPrimary>
        </>
      }
    >
      <TableSimple
        items={items}
        headers={[
          {
            name: "type",
            title: t("models.blacklist.type"),
            value: (i) => i.type,
            formattedValue: (i) => <SimpleBadge title={i.type} color={getColor(i.type)} />,
          },
          {
            name: "value",
            title: t("models.blacklist.value"),
            value: (i) => i.value,
            className: "w-full",
          },
          {
            name: "registerAttempts",
            title: t("models.blacklist.registerAttempts"),
            value: (i) => i.registerAttempts,
          },
          {
            name: "createdAt",
            title: t("shared.createdAt"),
            value: (item) => DateUtils.dateAgo(item.createdAt),
            className: "text-muted-foreground text-xs",
            breakpoint: "sm",
          },
        ]}
        actions={[
          {
            title: t("shared.delete"),
            onClick: (_, i) => onDelete(i),
            disabled: () => isSubmitting || isPending,
          },
        ]}
        pagination={pagination}
      />

      <Modal open={adding} setOpen={() => setAdding(false)} size="md">
        <h3 className="mb-2 font-medium">{t("shared.add")}</h3>
        <form ref={formRef} onSubmit={handleSubmit}>
          <input type="hidden" name="action" value="create" />
          <div className="space-y-2">
            <InputSelect
              withSearch={false}
              value={type}
              onChange={(value) => setType(value?.toString() ?? "")}
              name="type"
              title={t("models.blacklist.type")}
              options={[
                { name: t("models.blacklist.types.email"), value: "email" },
                { name: t("models.blacklist.types.domain"), value: "domain" },
                { name: t("models.blacklist.types.ip"), value: "ip" },
              ]}
            />
            <InputText name="value" title={t("models.blacklist.value")} className="w-full" required defaultValue="" />
            <div className="flex justify-end">
              <ButtonPrimary disabled={isSubmitting || isPending} type="submit">
                {t("shared.add")}
              </ButtonPrimary>
            </div>
          </div>
        </form>
      </Modal>
    </EditPageLayout>
  );
}
