import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}
export default function Divider({ children }: Props) {
  return (
    <div className="relative">
      <div className="absolute inset-0 flex items-center" aria-hidden="true">
        <div className="w-full border-t border-border" />
      </div>
      <div className="relative flex justify-center">
        <span className="bg-background px-2 text-sm text-muted-foreground">{children}</span>
      </div>
    </div>
  );
}
