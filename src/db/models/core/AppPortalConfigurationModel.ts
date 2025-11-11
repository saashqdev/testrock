import { JsonPropertiesValuesDto } from "@/modules/jsonProperties/dtos/JsonPropertiesValuesDto";
import { JsonPropertyDto } from "@/modules/jsonProperties/dtos/JsonPropertyTypeDto";
import { Portal } from "@prisma/client";

export type AppPortalConfigurationDto = {
  enabled: boolean;
  forTenants: boolean;
  pricing: boolean;
  analytics: boolean;
  default: { enabled: boolean; path: string; title: string };
  domains?: {
    enabled: boolean;
    provider: "fly";
    portalAppId: string;
    records?: { A: string; AAAA: string };
  };
  metadata: Array<JsonPropertyDto> | undefined;
  pages: Array<PortalPageConfigDto>;
};

export type PortalPageConfigDto = {
  name: string;
  title: string;
  slug: string;
  properties: Array<JsonPropertyDto>;
};
