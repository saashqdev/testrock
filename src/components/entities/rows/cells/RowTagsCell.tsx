import { clsx } from "clsx";
import { RowTagWithDetailsDto} from "@/db/models/entityBuilder/RowTagsModel";
import { getBackgroundColor } from "@/lib/shared/ColorUtils";

export default function RowTagsCell({ items }: { items: RowTagWithDetailsDto[] }) {
  return (
    <div>
      {items?.map((rowTag) => {
        return (
          <div
            key={rowTag.id}
            className="relative mx-0.5 inline-flex max-w-sm select-none items-center space-x-0.5 overflow-x-auto rounded-full border border-border bg-secondary px-2 py-0.5"
          >
            <div className="absolute flex shrink-0 items-center justify-center">
              <span className={clsx("h-1.5 w-1.5 rounded-full", getBackgroundColor(rowTag.tag.color))} aria-hidden="true" />
            </div>
            <div className="pl-2 text-xs font-medium text-muted-foreground">{rowTag.tag.value}</div>
          </div>
        );
      })}
    </div>
  );
}
