import clsx from "clsx";

interface Props {
  items: {
    name: string;
    stat: string;
    hint?: string;
  }[];
}
export default function SimpleStats({ items }: Props) {
  return (
    <div>
      <dl
        className={clsx(
          "grid grid-cols-1 gap-3",
          items.length === 1 && "md:grid-cols-1",
          items.length === 2 && "grid-cols-2",
          items.length === 3 && "md:grid-cols-3"
        )}
      >
        {items.map((item) => (
          <div key={item.name} className="shadow-xs overflow-hidden rounded-lg bg-background px-4 py-3">
            <dt className="truncate text-xs font-medium text-muted-foreground">{item.name}</dt>
            <dd className="mt-1 truncate text-lg font-semibold text-foreground">
              {item.stat} {item.hint && <span className="text-xs text-muted-foreground">{item.hint}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
