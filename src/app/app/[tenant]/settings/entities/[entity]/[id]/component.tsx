"use client";

import PropertyForm from "@/components/entities/properties/PropertyForm";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { PropertyWithDetailsDto, EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { FormulaDto } from "@/modules/formulas/dtos/FormulaDto";

type LoaderData = {
  entity: EntityWithDetailsDto;
  item: PropertyWithDetailsDto;
  formulas: FormulaDto[];
};

interface Props {
  data: LoaderData;
}

export default function EditEntityPropertyClient({ data }: Props) {
  const appOrAdminData = useAppOrAdminData();

  return <PropertyForm item={data.item} properties={[]} entities={appOrAdminData?.entities ?? []} formulas={data.formulas} />;
}
