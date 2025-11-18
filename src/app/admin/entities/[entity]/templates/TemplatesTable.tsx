"use client";

import TableSimple from "@/components/ui/tables/TableSimple";
import ShowPayloadModalButton from "@/components/ui/json/ShowPayloadModalButton";
import { EntityTemplate } from "@prisma/client";
import { useTranslation } from "react-i18next";

interface ItemWithConfig extends EntityTemplate {
  configDisplay: string;
}

interface Props {
  items: ItemWithConfig[];
}

export default function TemplatesTable({ items }: Props) {
  const { t } = useTranslation();

  return (
    <TableSimple
      headers={[
        {
          name: "title",
          title: "Title",
          value: (item) => item.title,
        },
        {
          title: "Template",
          name: "template",
          className: "max-w-xs",
          value: (item) => <ShowPayloadModalButton title={`Template: ${item.title}`} payload={item.configDisplay} />,
        },
      ]}
      items={items}
      actions={[
        {
          title: t("shared.edit"),
          onClickRoute: (idx, item) => item.id,
        },
      ]}
    />
  );
}
