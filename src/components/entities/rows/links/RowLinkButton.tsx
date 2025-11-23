"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { ExternalLinkIcon } from "lucide-react";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import EntityHelper from "@/lib/helpers/EntityHelper";

export default function RowLinkButton({ entityName, id }: { entityName: string; id: string }) {
  const appOrAdminData = useAppOrAdminData();
  const params = useParams();

  if (!appOrAdminData) {
    return null;
  }

  const entity = appOrAdminData.entities.find((f) => f.name === entityName);

  if (!entity) {
    return null;
  }

  return (
    <Link
      onClick={(e) => e.stopPropagation()}
      href={`${EntityHelper.getEntityRoute({ entity, params, appOrAdminData })}/${id}`}
      className="absolute right-2 top-2 z-10 hidden rounded-md border border-border bg-background p-2 opacity-80 hover:border-border hover:opacity-100 group-hover:block"
    >
      <ExternalLinkIcon className="h-4 w-4 text-foreground/80" />
    </Link>
  );
}
