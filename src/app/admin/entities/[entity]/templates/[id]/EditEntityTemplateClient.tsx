"use client";

import { EntityTemplate } from "@prisma/client";
import { useRouter, useParams } from "next/navigation";
import EntityTemplateForm from "@/components/entities/entityTemplates/EntityTemplateForm";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import UrlUtils from "@/utils/app/UrlUtils";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";

interface EditEntityTemplateClientProps {
  entity: EntityWithDetailsDto;
  item: EntityTemplate;
  entitySlug: string;
}

export default function EditEntityTemplateClient({ entity, item, entitySlug }: EditEntityTemplateClientProps) {
  const params = useParams();
  const router = useRouter();
  
  function close() {
    router.push(UrlUtils.getModulePath(params, `entities/${entitySlug}/templates`));
  }
  
  return (
    <SlideOverWideEmpty title="Edit Entity Template" open={true} className="sm:max-w-lg" onClose={close}>
      <EntityTemplateForm entity={entity} item={item} />
    </SlideOverWideEmpty>
  );
}
