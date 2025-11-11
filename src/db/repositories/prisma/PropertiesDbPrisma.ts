import { IPropertiesDb } from "@/db/interfaces/entityBuilder/IPropertiesDb";
import { PropertyType } from "@/lib/enums/entities/PropertyType";
import { Colors } from "@/lib/enums/shared/Colors";
import { prisma } from "@/db/config/prisma/database";
import { defaultProperties } from "@/lib/helpers/PropertyHelper";
import { CreatePropertyDto } from "@/db/models/entityBuilder/PropertiesModel";
export class PropertiesDbPrisma implements IPropertiesDb {
  async getProperty(id: string) {
    return await prisma.property.findUnique({
      where: {
        id,
      },
      include: {
        attributes: true,
        options: {
          orderBy: {
            order: "asc",
          },
        },
        formula: true,
      },
    });
  }

  async getEntityPropertyByName(entityId: string, name: string) {
    return await prisma.property.findFirst({
      where: {
        entityId,
        name,
      },
      include: {
        attributes: true,
        options: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });
  }

  async createProperty(data: {
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
  }) {
    if (data.name.includes(" ")) {
      throw Error("Property names cannot contain spaces: " + data.name);
    }
    if (data.name.includes("-")) {
      throw Error("Property names cannot contain '-': " + data.name);
    }
    return await prisma.property.create({
      data,
    });
  }

  async createProperties(entityId: string, fields: CreatePropertyDto[]) {
    return await Promise.all(
      fields.map(async (field, idx) => {
        const property = await this.createProperty({
          entityId,
          order: defaultProperties.length + idx + 1,
          name: field.name,
          title: field.title,
          type: field.type,
          subtype: field.subtype ?? null,
          isRequired: field.isRequired ?? true,
          isDefault: field.isDefault ?? false,
          isHidden: field.isHidden ?? false,
          isDisplay: field.isDisplay ?? false,
          isReadOnly: field.isReadOnly ?? false,
          canUpdate: field.canUpdate ?? true,
          showInCreate: field.showInCreate ?? true,
          formulaId: field.formulaId ?? null,
          tenantId: field.tenantId ?? null,
        });

        if (field.options) {
          await this.updatePropertyOptions(
            property.id,
            field.options.map((option) => {
              return {
                order: option.order,
                value: option.value,
                name: option.name ?? null,
                color: option.color,
              };
            })
          );
        }
        if (field.attributes) {
          await this.updatePropertyAttributes(property.id, field.attributes);
        }
        return property;
      })
    );
  }

  async updateProperty(
    id: string,
    data: {
      name?: string;
      title?: string;
      type?: PropertyType;
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
  ) {
    const property = await prisma.property.update({
      where: { id },
      data,
    });

    return property;
  }

  async updatePropertyOrder(id: string, order: number) {
    return await prisma.property.update({
      where: { id },
      data: {
        order,
      },
    });
  }

  async updatePropertyOptions(id: string, options: { order: number; value: string; name?: string | null; color?: Colors }[]) {
    await prisma.propertyOption.deleteMany({
      where: { propertyId: id },
    });
    await Promise.all(
      options.map(async (option) => {
        return await prisma.propertyOption.create({
          data: {
            propertyId: id,
            order: option.order,
            value: option.value,
            name: option.name ?? null,
            color: option.color,
          },
        });
      })
    );
  }

  async updatePropertyAttributes(id: string, attributes: { name: string; value: string }[]) {
    await prisma.propertyAttribute.deleteMany({
      where: { propertyId: id },
    });
    await Promise.all(
      attributes
        .filter((f) => f.value !== undefined)
        .map(async (attribute) => {
          return await prisma.propertyAttribute.create({
            data: {
              propertyId: id,
              name: attribute.name,
              value: attribute.value,
            },
          });
        })
    );
  }

  async deleteProperty(id: string) {
    return await prisma.property.delete({
      where: { id },
    });
  }
}
