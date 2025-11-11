"use client";

import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import MonacoEditor, { MonacoAutoCompletion } from "@/components/editors/MonacoEditor";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

type MonacoEditorClientProps = {
  allEntities: EntityWithDetailsDto[];
};

export default function MonacoEditorClient({ allEntities }: MonacoEditorClientProps) {
  const { t } = useTranslation();

  const [value, setValue] = useState("");
  const [autocompletions, setAutocompletions] = useState<MonacoAutoCompletion[]>([]);

  useEffect(() => {
    const autocompletions: MonacoAutoCompletion[] = [];
    allEntities
      .sort((a, b) => a.order - b.order)
      .forEach((entity) => {
        // autocompletions.push({
        //   label: `row.${entity.name}`,
        //   kind: monaco.languages.CompletionItemKind.Text,
        //   documentation: t(entity.titlePlural),
        //   insertText: `"${entity.name}": "*"`,
        //   range: range,
        // });

        entity.properties
          .filter((f) => !f.isDefault)
          .sort((a, b) => a.order - b.order)
          .forEach((property) => {
            const label = `row.${entity.name}.${property.name}`;
            autocompletions.push({
              label,
              kind: "Value",
              documentation: t(property.title),
              insertText: `{{${label}}}`,
            });
          });

        entity.childEntities.forEach((child) => {
          const childEntity = allEntities.find((f) => f.id === child.childId);
          if (!childEntity) {
            return;
          }
          childEntity.properties
            .filter((f) => !f.isDefault)
            .sort((a, b) => a.order - b.order)
            .forEach((property) => {
              const label = `row.${entity.name}.${childEntity.name}.${property.name}`;
              autocompletions.push({
                label,
                kind: "Value",
                documentation: t(property.title),
                insertText: `{{${label}}}`,
                // range: range,
              });
            });
        });
      });
    setAutocompletions(autocompletions);
  }, [allEntities, t]);

  return (
    <div className="h-[calc(100vh-100px)]">
      <MonacoEditor theme="vs-dark" fontSize={15} value={value} onChange={(e) => setValue(e)} autocompletions={autocompletions} />
    </div>
  );
}
