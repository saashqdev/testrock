"use client";

import { useTranslation } from "react-i18next";
import { useRouter } from "next/navigation";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import { EntityRelationshipWithDetailsDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";
import EntityRelationshipsTable from "@/components/entities/relationships/EntityRelationshipsTable";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";

interface EditEntityRelationshipsClientProps {
  items: (EntityRelationshipWithDetailsDto & { _count: { rows: number } })[];
}

export default function EditEntityRelationshipsClient({ items }: EditEntityRelationshipsClientProps) {
  const { t } = useTranslation();
  const router = useRouter();

  return (
    <>
      <div className="space-y-3">
        <h3 className="text-foreground text-sm font-medium leading-3">{t("models.relationship.plural")}</h3>
        <EntityRelationshipsTable items={items} editable={true} />
        <div className="w-fu flex justify-start">
          <ButtonTertiary to="new">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <span className="font-medium uppercase">{t("shared.add")}</span>
          </ButtonTertiary>
        </div>
      </div>

      <SlideOverWideEmpty
        title={""}
        open={!!<></>}
        onClose={() => {
          router.replace(".");
        }}
        className="2xl"
        overflowYScroll={true}
      >
        <div className="-mx-1 -mt-3">
          <div className="space-y-4">{<></>}</div>
        </div>
      </SlideOverWideEmpty>
    </>
  );
}
