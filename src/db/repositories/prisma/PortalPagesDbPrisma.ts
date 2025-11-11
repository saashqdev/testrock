import { IPortalPagesDb } from "@/db/interfaces/portals/IPortalPagesDb";
import { prisma } from "@/db/config/prisma/database";
import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";

export class PortalPagesDbPrisma implements IPortalPagesDb {
  async getPortalPages(portalId: string) {
    return await prisma.portalPage.findMany({
      where: {
        portalId,
      },
    });
  }

  async getPortalPagesByName(portalId: string, name: string) {
    return await prisma.portalPage.findUnique({
      where: {
        portalId_name: {
          portalId,
          name,
        },
      },
    });
  }

  async createPortalPage(data: { portalId: string; name: string; attributes: JsonPropertiesValuesDto }) {
    return await prisma.portalPage.create({
      data: {
        portalId: data.portalId,
        name: data.name,
        attributes: data.attributes,
      },
    });
  }

  async updatePortalPage(id: string, data: { attributes: JsonPropertiesValuesDto }) {
    return await prisma.portalPage.update({
      where: {
        id,
      },
      data: {
        attributes: data.attributes,
      },
    });
  }

  async deletePortalPage(id: string) {
    return await prisma.portalPage.delete({
      where: {
        id,
      },
    });
  }
}
