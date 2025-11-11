"use client";

import Link from "next/link";
import NumberUtils from "@/lib/shared/NumberUtils";

export default function RowFolioCell({ prefix, folio, href, onClick }: { prefix: string; folio: number; href?: string; onClick?: () => void }) {
  function getText() {
    return `${prefix}-${NumberUtils.pad(folio ?? 0, 4)}`;
  }
  return (
    <>
      {href ? (
        <Link
          href={href}
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="hover rounded-md border border-b border-border bg-secondary px-1 py-0.5 text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {getText()}
        </Link>
      ) : onClick ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onClick();
          }}
          className="hover rounded-md border border-b border-border bg-secondary px-1 py-0.5 text-center text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          {getText()}
        </button>
      ) : (
        <div>{getText()}</div>
      )}
    </>
  );
}
