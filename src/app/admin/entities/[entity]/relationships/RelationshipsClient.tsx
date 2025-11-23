"use client";

import { useTranslation } from "react-i18next";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import EntityRelationshipsTable from "@/components/entities/relationships/EntityRelationshipsTable";
import { setRelationshipOrders } from "./actions";

interface EditEntityRelationshipsClientProps {
  items: (EntityRelationshipWithDetailsDto & { _count: { rows: number } })[];
}

export default function EditEntityRelationshipsClient({ items }: EditEntityRelationshipsClientProps) {
  const { t } = useTranslation();
  const params = useParams();

  async function onReorder(reorderedItems: (EntityRelationshipWithDetailsDto & { _count: { rows: number } })[]) {
    try {
      const orders = reorderedItems.map((item) => ({ id: item.id, order: item.order ?? 0 }));
      await setRelationshipOrders(params.entity as string, orders);
    } catch (error: any) {
      toast({ title: "Error", description: error.message || t("shared.error"), variant: "destructive" });
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium leading-3 text-foreground">{t("models.relationship.plural")}</h3>
      <EntityRelationshipsTable items={items} editable={true} onReorder={onReorder} />
      <div className="flex w-full justify-start">
        <ButtonTertiary to="relationships/new">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span className="font-medium uppercase">{t("shared.add")}</span>
        </ButtonTertiary>
      </div>
    </div>
  );
}
