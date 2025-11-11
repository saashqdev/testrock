import { RowValueRangeDto } from "@/lib/dtos/entities/RowValueRangeDto";
import RowDateCell from "./RowDateCell";
import { DateFormatType } from "@/lib/shared/DateUtils";

interface Props {
  value: RowValueRangeDto;
  format?: DateFormatType;
}
export default function RowRangeDateCell({ value, format }: Props) {
  return (
    <div className="flex items-center space-x-1">
      <RowDateCell value={value?.dateMin ?? undefined} format={format} />
      <div className="text-muted-foreground">-</div>
      <RowDateCell value={value?.dateMax ?? undefined} format={format} />
    </div>
  );
}
