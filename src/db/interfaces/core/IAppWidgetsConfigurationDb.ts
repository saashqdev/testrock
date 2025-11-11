import { TFunction } from "i18next";
import { AppWidgetsConfigurationDto } from "@/db/models/core/AppWidgetsConfigurationModel";

export interface IAppWidgetsConfigurationDb {
  getWidgetsConfiguration({ t }: { t: TFunction<"translation", undefined> }): Promise<AppWidgetsConfigurationDto>;
}
