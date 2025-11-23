import { Colors } from "@/lib/enums/shared/Colors";
import { PropertyType } from "@/lib/enums/entities/PropertyType";

export type PropertiesModel = {
  name: string;
  id: string;
  entityId: string;
  order: number;
  title: string;
  type: number;
  subtype: string | null;
  isDefault: boolean;
  isRequired: boolean;
  isHidden: boolean;
  isDisplay: boolean;
  isUnique: boolean;
  isReadOnly: boolean;
  showInCreate: boolean;
  canUpdate: boolean;
  formulaId: string | null;
  tenantId: string | null;
};

export type CreatePropertyDto = {
  name: string;
  title: string;
  type: PropertyType;
  subtype: string | null;
  isRequired?: boolean;
  isDefault?: boolean;
  isHidden?: boolean;
  isDisplay?: boolean;
  isReadOnly?: boolean;
  canUpdate?: boolean;
  showInCreate?: boolean;
  formulaId?: string | null;
  tenantId?: string | null;
  options?: { order: number; value: string; name?: string; color?: Colors }[];
  attributes?: {
    name: string;
    value: string;
  }[];
};
