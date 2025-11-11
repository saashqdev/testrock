import { getServerTranslations } from "@/i18n/server";
import TemplateApiService from "@/lib/helpers/server/TemplateApiService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import { db } from "@/db";
import { RowAsJson } from "@/lib/helpers/TemplateApiHelper";
import HandlebarsPlaygroundClient from "./HandlebarsPlaygroundClient";

type LoaderData = {
  items: RowAsJson[];
};

async function getData(): Promise<LoaderData> {
  const { t } = await getServerTranslations();
  const entities = await db.entities.getAllEntities(null);
  const items: RowAsJson[] = [];
  for (const entity of entities) {
    const rows = await db.rows.getAllRows(entity.id);
    for (const row of rows) {
      const rowAsJson = await TemplateApiService.getRowInApiFormatWithRecursiveRelationships({
        entities,
        rowId: row.id,
        t,
        options: {
          exclude: ["id", "folio", "createdAt", "updatedAt", "createdByUser", "createdByApiKey"],
        },
      });
      if (rowAsJson) {
        items.push(rowAsJson);
      }
    }
  }
  return {
    items,
  };
}

export default async function HandlebarsPlaygroundPage(props: IServerComponentsProps) {
  const data = await getData();
  return <HandlebarsPlaygroundClient items={data.items} />;
}
