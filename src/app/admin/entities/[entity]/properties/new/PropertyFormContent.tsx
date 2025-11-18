"use client";

import PropertyForm from "@/components/entities/properties/PropertyForm";
import { EntityDto, PropertyWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";

type Props = {
  properties: PropertyWithDetailsDto[];
  entities: EntityDto[];
  formulas: FormulaDto[];
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel?: () => void;
};

export default function PropertyFormContent({ properties, entities, formulas, onSubmit, onCancel }: Props) {
  return <PropertyForm properties={properties} entities={entities} formulas={formulas} onSubmit={onSubmit} onCancel={onCancel} />;
}
