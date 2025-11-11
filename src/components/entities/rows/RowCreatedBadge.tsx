import DateCell from "@/components/ui/dates/DateCell";
import { RowWithCreatedByDto } from "@/db/models/entityBuilder/RowsModel";
import { DateDisplay } from "@/lib/shared/DateUtils";
import RowCreatedByBadge from "./RowCreatedByBadge";

interface Props {
  row: RowWithCreatedByDto;
  by?: { withEmail?: boolean };
  date?: { displays?: DateDisplay[] };
}
export default function RowCreatedBadge({ row, by = { withEmail: true }, date = { displays: ["ymd"] } }: Props) {
  return (
    <div className="flex flex-col">
      {date && <DateCell displays={date.displays} date={row.createdAt} />}
      {by && <RowCreatedByBadge row={row} withEmail={by.withEmail} />}
    </div>
  );
}
