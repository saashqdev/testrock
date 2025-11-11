import Link from "next/link";
import { Button } from "../button";

export default function BackButtonWithTitle({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2 truncate text-base sm:text-lg md:text-xl">
      <Button size="xs" variant="outline" asChild className="truncate font-normal">
        <Link href={href}>&laquo;</Link>
      </Button>
      <div>{children}</div>
    </div>
  );
}
