"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import PromptTemplateEditors from "@/modules/promptBuilder/components/templates/PromptTemplateEditors";
import SelectEntityRowSelectors from "@/modules/promptBuilder/components/templates/SelectEntityRowSelectors";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import TemplateApiHelper, { RowAsJson } from "@/lib/helpers/TemplateApiHelper";

interface HandlebarsPlaygroundClientProps {
  items: RowAsJson[];
}

export default function HandlebarsPlaygroundClient({ items }: HandlebarsPlaygroundClientProps) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const [templateDto, setTemplateDto] = useState<{
    source: string;
    template: string;
    result: string;
  }>({
    source: "",
    template: "",
    result: "",
  });
  const [row, setRow] = useState<RowAsJson | null>(null);

  useEffect(() => {
    if (!appOrAdminData) return;

    // let object: any = {};
    // if (row) {
    //   object = { ...object, row: row.data };
    // }
    let variables: { [key: string]: string } = {};
    setTemplateDto({
      ...templateDto,
      source: JSON.stringify(
        TemplateApiHelper.getTemplateValue({
          allEntities: appOrAdminData.entities,
          session: {
            user: appOrAdminData.user,
            tenant: row?.tenant ?? null,
          },
          t,
          row: row ?? undefined,
          variables,
        }),
        null,
        2
      ),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [row, appOrAdminData]);

  return (
    <div className="space-y-2 p-2">
      <SelectEntityRowSelectors rows={items} onChange={(row) => setRow(row)} />
      <PromptTemplateEditors value={templateDto} onChange={(value) => setTemplateDto(value)} promptFlow={undefined} sampleSourceRow={row} />
    </div>
  );
}
