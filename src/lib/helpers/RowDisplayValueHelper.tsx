import Link from "next/link";
import { TFunction } from "i18next";
import { RowHeaderDisplayDto } from "@/lib/dtos/data/RowHeaderDisplayDto";
import { InputType } from "@/lib/enums/shared/InputType";
import InputNumber from "@/components/ui/input/InputNumber";
import InputSelect from "@/components/ui/input/InputSelect";
import InputText from "@/components/ui/input/InputText";

function displayRowValue<T>(t: TFunction, header: RowHeaderDisplayDto<T>, item: T, idxRow: number) {
  return (
    <>
      {!header.setValue ? (
        <>
          {header.href !== undefined && header.href(item) ? (
            <Link
              onClick={(e) => {
                e.stopPropagation();
              }}
              href={header.href(item) ?? ""}
              className="rounded-md border-b border-dashed border-transparent hover:border-border focus:bg-secondary/90"
            >
              <span>{header.formattedValue ? header.formattedValue(item, idxRow) : header.value(item, idxRow)}</span>
            </Link>
          ) : (
            <span>{header.formattedValue ? header.formattedValue(item, idxRow) : header.value(item, idxRow)}</span>
          )}
        </>
      ) : (
        <>
          {header.type === undefined || header.type === InputType.TEXT ? (
            <InputText
              borderless={header.inputBorderless}
              withLabel={false}
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              disabled={header.editable && !header.editable(item, idxRow)}
              setValue={(e) => {
                if (header.setValue) {
                  header.setValue(e, idxRow);
                }
              }}
              required={!header.inputOptional}
            />
          ) : header.type === InputType.NUMBER ? (
            <InputNumber
              borderless={header.inputBorderless}
              withLabel={false}
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              disabled={header.editable && !header.editable(item)}
              onChange={(e) => {
                if (header.setValue) {
                  header.setValue(e, idxRow);
                }
              }}
              required={!header.inputOptional}
              step={header.inputNumberStep}
            />
          ) : header.type === InputType.SELECT ? (
            <InputSelect
              borderless={header.inputBorderless}
              withLabel={false}
              name={header.name}
              title={t(header.title)}
              value={header.value(item, idxRow)}
              onChange={(e) => {
                if (header.setValue) {
                  header.setValue(Number(e), idxRow);
                }
              }}
              options={header.options ?? []}
              required={!header.inputOptional}
              disabled={header.editable && !header.editable(item)}
            />
          ) : (
            <></>
          )}
        </>
      )}
    </>
  );
}

export default {
  displayRowValue,
};
