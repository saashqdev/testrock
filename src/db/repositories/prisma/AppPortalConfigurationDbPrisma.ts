import { IAppPortalConfigurationDb } from "@/db/interfaces/core/IAppPortalConfigurationDb";
import { AppPortalConfigurationDto } from "@/db/models/core/AppPortalConfigurationModel";
import { JsonPropertyDto } from "@/modules/jsonProperties/dtos/JsonPropertyTypeDto";
import { TFunction } from "i18next";

export class AppPortalConfigurationDbPrisma implements IAppPortalConfigurationDb {
  async getAppPortalConfiguration({ t }: { t: TFunction }): Promise<AppPortalConfigurationDto> {
    const titleProperty: JsonPropertyDto = {
      name: "title",
      title: t("models.portal.title"),
      type: "string",
      required: true,
    };
    const descriptionProperty: JsonPropertyDto = {
      name: "description",
      title: t("models.portal.description"),
      type: "string",
      required: false,
    };
    const htmlProperty: JsonPropertyDto = {
      name: "html",
      title: t("shared.content"),
      type: "string",
      required: true,
    };

    const seoProperties: JsonPropertyDto[] = [
      {
        name: "seoTitle",
        title: t("shared.title"),
        type: "string",
        required: false,
        group: "SEO",
      },
      {
        name: "seoDescription",
        title: t("shared.description"),
        type: "string",
        required: false,
        group: "SEO",
      },
      {
        name: "seoImage",
        title: t("shared.image"),
        type: "image",
        required: false,
        group: "SEO",
      },
    ];

    const conf: AppPortalConfigurationDto = {
      enabled: true,
      forTenants: true,
      pricing: true,
      analytics: true,
      default: { enabled: true, path: "/portal", title: t("models.portal.defaultTitle") },
      domains: {
        enabled: true,
        provider: "fly",
        portalAppId: "therock-portal",
        records: {
          A: "66.241.125.25",
          AAAA: "2a09:8280:1::31:5dc2:0",
        },
      },
      metadata: [],
      pages: [
        {
          name: "pricing",
          title: t("models.portal.pages.pricing"),
          slug: "/pricing",
          properties: [titleProperty, descriptionProperty, ...seoProperties],
        },
        {
          name: "privacy-policy",
          title: t("models.portal.pages.privacyPolicy"),
          slug: "/privacy-policy",
          properties: [titleProperty, descriptionProperty, htmlProperty, ...seoProperties],
        },
        {
          name: "terms-and-conditions",
          title: t("models.portal.pages.termsAndConditions"),
          slug: "/terms-and-conditions",
          properties: [titleProperty, descriptionProperty, htmlProperty, ...seoProperties],
        },
      ],
    };

    return conf;
  }
}
