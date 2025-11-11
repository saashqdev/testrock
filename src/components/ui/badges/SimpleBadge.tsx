import { Colors } from "@/lib/enums/shared/Colors";
import { cn } from "@/lib/utils";
import { getBadgeColor, getBadgeColorDark } from "@/lib/shared/ColorUtils";

interface Props {
  title?: string;
  color: Colors;
  className?: string;
  children?: React.ReactNode;
  underline?: boolean;
  darkMode?: boolean;
}

export default function SimpleBadge({ title, color, className, children, underline, darkMode }: Props) {
  return (
    <div
      className={cn(
        className,
        !underline && "inline-flex",
        "items-center rounded-md px-1 py-0 text-xs font-bold",
        getBadgeColor(color),
        getBadgeColorDark(color)
      )}
    >
      {title ?? children}
    </div>
  );
}
