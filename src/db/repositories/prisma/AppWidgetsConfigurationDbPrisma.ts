import { IAppWidgetsConfigurationDb } from "@/db/interfaces/core/IAppWidgetsConfigurationDb";
import { TFunction } from "i18next";
import { AppWidgetsConfigurationDto } from "@/db/models/core/AppWidgetsConfigurationModel";

export class AppWidgetsConfigurationDbPrisma implements IAppWidgetsConfigurationDb {
  async getWidgetsConfiguration({ t }: { t: TFunction }): Promise<AppWidgetsConfigurationDto> {
    const conf: AppWidgetsConfigurationDto = {
      enabled: false,
      metadata: [
        // {
        //   name: "description",
        //   title: t("shared.description"),
        //   type: "string",
        //   required: true,
        // },
      ],
      chatWidget: { enabled: false, provider: "tawkto", config: {} },
    };

    return conf;
  }
}
