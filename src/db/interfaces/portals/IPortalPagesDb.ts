import { JsonValue, JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";

export interface IPortalPagesDb {
  getPortalPages(portalId: string): Promise<
    {
      id: string;
      createdAt: Date;
      updatedAt: Date;
      portalId: string;
      name: string;
      attributes: JsonValue;
    }[]
  >;
  getPortalPagesByName(
    portalId: string,
    name: string
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    portalId: string;
    name: string;
    attributes: JsonValue;
  } | null>;
  createPortalPage(data: { portalId: string; name: string; attributes: JsonPropertiesValuesDto }): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    portalId: string;
    name: string;
    attributes: JsonValue | null;
  }>;
  updatePortalPage(
    id: string,
    data: {
      attributes: JsonPropertiesValuesDto;
    }
  ): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    portalId: string;
    name: string;
    attributes: JsonValue | null;
  }>;
  deletePortalPage(id: string): Promise<{
    id: string;
    createdAt: Date;
    updatedAt: Date;
    portalId: string;
    name: string;
    attributes: JsonValue;
  }>;
}
