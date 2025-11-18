"use client";

import { useRouter } from "next/navigation";
import EntityRelationshipForm from "@/components/entities/relationships/EntityRelationshipForm";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityRelationshipWithCountDto } from "@/db/models/entityBuilder/EntityRelationshipsModel";

interface EditEntityRelationshipClientProps {
  entity: EntityWithDetailsDto;
  entities: EntityWithDetailsDto[];
  item: EntityRelationshipWithCountDto;
  entitySlug: string;
}

export default function EditEntityRelationshipClient({ entity, entities, item, entitySlug }: EditEntityRelationshipClientProps) {
  const router = useRouter();
  
  function close() {
    router.push(`/admin/entities/${entitySlug}/relationships`);
  }
  
  return (
    <SlideOverWideEmpty title="Edit Relationship" open={true} className="2xl" onClose={close}>
      <EntityRelationshipForm entity={entity} entities={entities} item={item} />
    </SlideOverWideEmpty>
  );
}
