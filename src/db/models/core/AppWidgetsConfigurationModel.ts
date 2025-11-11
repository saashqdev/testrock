import { JsonPropertyDto } from "@/modules/jsonProperties/dtos/JsonPropertyTypeDto";

export type AppWidgetsConfigurationDto = {
  enabled: boolean;
  metadata: Array<JsonPropertyDto> | undefined;
  chatWidget: { enabled: false; provider: "tawkto"; config: {} } | { enabled: false; provider: "tawkto"; config: { [key: string]: any } };
};
