"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import SlideOverWideEmpty from "@/components/ui/slideOvers/SlideOverWideEmpty";
import UrlUtils from "@/utils/app/UrlUtils";
import { EntityWithDetailsDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";
import { createPropertyAction } from "./actions";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import PropertyForm from "@/components/entities/properties/PropertyForm";

type Props = {
  properties: PropertyWithDetailsDto[];
  entities: EntityWithDetailsDto[];
  formulas: FormulaDto[];
};

export default function NewPropertyClient({ properties, entities, formulas }: Props) {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);

  function close() {
    setIsOpen(false);
    setTimeout(() => {
      router.push(UrlUtils.getModulePath(params, `entities/${params.entity}/properties`));
    }, 300);
  }

  async function handleSubmit(formData: FormData) {
    try {
      await createPropertyAction(formData, params.entity as string);
      toast.success(t("shared.saved"));
      close();
    } catch (error: any) {
      toast.error(error.message || t("shared.error"));
    }
  }

  return (
    <SlideOverWideEmpty title={t("models.property.actions.add")} open={isOpen} onClose={close} size="3xl" overflowYScroll={true}>
      <PropertyForm properties={properties} entities={entities} formulas={formulas} onSubmit={handleSubmit} onCancel={close} />
    </SlideOverWideEmpty>
  );
}
