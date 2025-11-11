import { Colors } from "@/lib/enums/shared/Colors";
import { CreatePropertyDto } from "@/db/models/entityBuilder/PropertiesModel";
import { PropertyType } from "@/lib/enums/entities/PropertyType";

export interface IPropertiesDb {
  getProperty(id: string): Promise<
    | ({
        formula: {
          id: string;
          name: string;
          createdAt: Date;
          description: string | null;
          resultAs: string;
          calculationTrigger: string;
          withLogs: boolean;
        } | null;
        attributes: {
          id: string;
          name: string;
          propertyId: string;
          value: string;
        }[];
        options: {
          id: string;
          order: number;
          name: string | null;
          propertyId: string;
          value: string;
          color: number;
        }[];
      } & {
        id: string;
        entityId: string;
        order: number;
        name: string;
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
      })
    | null
  >;

  getEntityPropertyByName(
    entityId: string,
    name: string
  ): Promise<
    | ({
        attributes: {
          id: string;
          name: string;
          propertyId: string;
          value: string;
        }[];
        options: {
          id: string;
          order: number;
          name: string | null;
          propertyId: string;
          value: string;
          color: number;
        }[];
      } & {
        id: string;
        entityId: string;
        order: number;
        name: string;
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
      })
    | null
  >;

  createProperty(data: {
    entityId: string;
    name: string;
    title: string;
    type: PropertyType;
    subtype: string | null;
    order: number;
    isDefault: boolean;
    isRequired: boolean;
    isHidden: boolean;
    isDisplay: boolean;
    isReadOnly: boolean;
    canUpdate: boolean;
    showInCreate: boolean;
    formulaId: string | null;
    tenantId: string | null;
  }): Promise<{
    id: string;
    entityId: string;
    order: number;
    name: string;
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
  }>;

  createProperties(
    entityId: string,
    fields: CreatePropertyDto[]
  ): Promise<
    {
      id: string;
      entityId: string;
      order: number;
      name: string;
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
    }[]
  >;

  updateProperty(
    id: string,
    data: {
      name?: string | undefined;
      title?: string | undefined;
      type?: PropertyType | undefined;
      subtype?: string | null;
      order?: number;
      isDefault?: boolean;
      isRequired?: boolean;
      isHidden?: boolean;
      isDisplay?: boolean;
      isReadOnly?: boolean;
      canUpdate?: boolean;
      showInCreate?: boolean;
      formulaId?: string | null;
    }
  ): Promise<{
    id: string;
    entityId: string;
    order: number;
    name: string;
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
  }>;

  updatePropertyOrder(
    id: string,
    order: number
  ): Promise<{
    id: string;
    entityId: string;
    order: number;
    name: string;
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
  }>;

  updatePropertyOptions(
    id: string,
    options: {
      order: number;
      value: string;
      name?: string | null | undefined;
      color?: Colors | undefined;
    }[]
  ): Promise<void>;

  updatePropertyAttributes(
    id: string,
    attributes: {
      name: string;
      value: string;
    }[]
  ): Promise<void>;

  deleteProperty(id: string): Promise<{
    id: string;
    entityId: string;
    order: number;
    name: string;
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
  }>;
}
