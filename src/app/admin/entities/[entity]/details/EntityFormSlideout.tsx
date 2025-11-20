"use client";

import { useRouter } from "next/navigation";
import { useTranslation } from "react-i18next";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import EntityForm from "@/components/entities/EntityForm";
import { Entity } from "@prisma/client";

interface Props {
  item: Entity;
}

export default function EntityFormSlideout({ item }: Props) {
  const { t } = useTranslation();
  const router = useRouter();
  
  function close() {
    router.push("/admin/entities");
  }

  return (
    <SlideOverWideEmpty 
      title={`${t("shared.edit")} ${t("models.entity.object")} ${t(item.title)}`} 
      size="5xl" 
      open={true} 
      onClose={close}
      overflowYScroll={true}
    >
      <EntityForm item={item} />
    </SlideOverWideEmpty>
  );
}
