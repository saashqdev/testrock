"use client";

import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";
import EntityTemplateForm from "@/components/entities/entityTemplates/EntityTemplateForm";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import UrlUtils from "@/utils/app/UrlUtils";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { createEntityTemplate } from "../actions";

type NewEntityTemplateClientProps = {
  entity: EntityWithDetailsDto;
  entitySlug: string;
};

export default function NewEntityTemplateClient({ entity, entitySlug }: NewEntityTemplateClientProps) {
  const params = useParams();
  const router = useRouter();
  
  function close() {
    router.push(UrlUtils.getModulePath(params, `entities/${entitySlug}/templates`));
  }
  
  async function handleSubmit(formData: FormData) {
    formData.set("action", "create");
    
    try {
      const result = await createEntityTemplate(entitySlug, formData);
      
      if (result?.error) {
        toast.error(result.error);
      }
      // Success case is handled by redirect in the server action
    } catch (error: any) {
      // Handle redirect or other errors
      if (error?.message?.includes("NEXT_REDIRECT")) {
        throw error; // Re-throw redirect errors
      }
      toast.error(error?.message || "An error occurred");
    }
  }
  
  return (
    <SlideOverWideEmpty title="New Entity Template" open={true} className="2xl" onClose={close}>
      <EntityTemplateForm entity={entity} onSubmit={handleSubmit} />
    </SlideOverWideEmpty>
  );
}
