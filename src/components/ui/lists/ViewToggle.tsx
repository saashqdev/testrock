import clsx from "clsx";
import TableIcon from "../icons/TableIcon";
import ViewBoardsIcon from "../icons/ViewBoardsIcon";

interface Props {
  view: "table" | "board";
  setView: (value: "table" | "board") => void;
}
export default function ViewToggle({ view, setView }: Props) {
  return (
    <span className="shadow-2xs relative z-0 inline-flex rounded-md">
      <button
        onClick={() => setView("table")}
        type="button"
        className={clsx(
          "focus:outline-hidden relative inline-flex items-center rounded-l-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary/90 focus:z-10 focus:border-border focus:ring-1 focus:ring-ring",
          view === "table" ? "bg-accent-100 text-accent-500" : "bg-background text-muted-foreground"
        )}
      >
        <TableIcon className="h-4 w-4" />
      </button>
      <button
        onClick={() => setView("board")}
        type="button"
        className={clsx(
          "focus:outline-hidden relative -ml-px inline-flex items-center rounded-r-md border border-border px-4 py-2.5 text-sm font-medium hover:bg-secondary/90 focus:z-10 focus:border-border focus:ring-1 focus:ring-ring",
          view === "board" ? "bg-accent-100 text-accent-500" : "bg-background text-muted-foreground"
        )}
      >
        <ViewBoardsIcon className="h-4 w-4" />
      </button>
    </span>
  );
}
