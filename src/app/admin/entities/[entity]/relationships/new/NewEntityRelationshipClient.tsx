"use client";

import { useRouter } from "next/navigation";
import EntityRelationshipForm from "@/components/entities/relationships/EntityRelationshipForm";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

interface NewEntityRelationshipClientProps {
  entity: EntityWithDetailsDto;
  entities: EntityWithDetailsDto[];
  entitySlug: string;
  onSubmit: (formData: FormData) => Promise<{ error?: string } | void>;
}

export default function NewEntityRelationshipClient({ entity, entities, entitySlug, onSubmit }: NewEntityRelationshipClientProps) {
  const router = useRouter();

  function close() {
    router.push(`/admin/entities/${entitySlug}/relationships`);
  }

  return (
    <SlideOverWideEmpty title="New Relationship" open={true} className="2xl" onClose={close}>
      <EntityRelationshipForm entity={entity} entities={entities} onSubmit={onSubmit} />
    </SlideOverWideEmpty>
  );
}
