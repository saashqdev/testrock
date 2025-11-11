import { AppPortalConfigurationDto } from "@/db/models/core/AppPortalConfigurationModel";
import { TFunction } from "i18next";

export interface IAppPortalConfigurationDb {
  getAppPortalConfiguration({ t }: { t: TFunction<"translation", undefined> }): Promise<AppPortalConfigurationDto>;
}
