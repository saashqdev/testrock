import { useRouter } from "next/navigation";
import { Action } from "kbar";
import { TFunction } from "i18next";
import { AppLoaderData } from "@/lib/state/useAppData";
import { getUserHasPermission } from "../PermissionsHelper";
import { RootDataDto } from "@/lib/state/useRootData";
import UrlUtils from "@/lib/utils/UrlUtils";

interface Props {
  t: TFunction;
  router: ReturnType<typeof useRouter>;
  appData?: AppLoaderData;
  rootData: RootDataDto;
}
function getCommands({ t, router, appData, rootData }: Props): Action[] {

  if (!appData) {
    return [];
  }
  
  const params = { tenant: appData.currentTenant.slug };
  
  const actions: Action[] = [
    {
      id: "dashboard",
      shortcut: [],
      name: t("app.sidebar.dashboard"),
      keywords: "",
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "dashboard"));
      },
    },
  ];

  if (rootData.appConfiguration?.portals?.enabled && rootData.appConfiguration?.portals?.forTenants) {
    actions.push({
      id: "portals",
      name: t("models.portal.plural"),
      shortcut: [],
      keywords: "",
      // subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "portals"));
      },
    });
    actions.push({
      id: "portals-new",
      name: t("models.portal.actions.new.title"),
      shortcut: [],
      keywords: "",
      subtitle: t("models.portal.actions.new.description"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "portals/new"));
      },
    });
  }

  appData.entities
    .filter((f) => f.showInSidebar)
    .forEach((entity) => {
      actions.push({
        id: "entity-" + entity.name,
        name: t(entity.titlePlural),
        perform: () => {
          router.push(UrlUtils.currentTenantUrl(params, entity.slug));
        },
      });
    });

  const crmEntities = appData.entities.filter((f) => ["companies", "contacts", "opportunities"].includes(f.slug));
  if (crmEntities.length >= 3) {
    actions.push({
      id: "crm",
      name: t("crm.title"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "crm"));
      },
    });
    actions.push({
      id: "emailMarketing",
      name: t("emailMarketing.title"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "email-marketing"));
      },
    });
  }
  actions.push({
    id: "profile",
    shortcut: [],
    name: t("app.commands.profile.title"),
    subtitle: t("app.sidebar.settings"),
    keywords: t("app.commands.profile.description"),
    perform: () => {
      router.push(UrlUtils.currentTenantUrl(params, "settings/profile"));
    },
  });
  if (getUserHasPermission(appData, "app.settings.members.view")) {
    actions.push({
      id: "members",
      name: t("app.navbar.members"),
      shortcut: [],
      keywords: "",
      subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "settings/members"));
      },
    });
  }
  // if (getUserHasPermission(appData, "app.settings.roles.view")) {
  //   actions.push({
  //     id: "roles",
  //     name: t("models.role.plural"),
  //     shortcut: [],
  //     keywords: "",
  //     subtitle: t("app.sidebar.settings"),
  //     perform: () => {
  //       router.push(`/app/${appData.currentTenant.slug}/settings/roles-and-permissions`);
  //     },
  //   });
  // }
  // actions.push({
  //   id: "roles",
  //   name: t("models.group.plural"),
  //   shortcut: [],
  //   keywords: "",
  //   subtitle: t("app.sidebar.settings"),
  //   perform: () => {
  //     router.push(`/app/${appData.currentTenant.slug}/settings/groups`);
  //   },
  // });
  if (getUserHasPermission(appData, "app.settings.subscription.view")) {
    actions.push({
      id: "subscription",
      name: t("app.navbar.subscription"),
      shortcut: [],
      keywords: "",
      subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "settings/subscription"));
      },
    });
  }
  if (getUserHasPermission(appData, "app.settings.account.view")) {
    actions.push({
      id: "account",
      name: t("app.navbar.tenant"),
      shortcut: [],
      keywords: "",
      subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "settings/account"));
      },
    });
  }
  if (rootData.appConfiguration?.app.features.tenantApiKeys && getUserHasPermission(appData, "app.settings.apiKeys.view")) {
    actions.push({
      id: "apiKeys",
      name: t("models.apiKey.plural"),
      shortcut: [],
      keywords: "",
      subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "settings/api"));
      },
    });
  }
  if (getUserHasPermission(appData, "app.settings.auditTrails.view")) {
    actions.push({
      id: "auditTrails",
      name: t("models.log.plural"),
      shortcut: [],
      keywords: "",
      subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "settings/logs"));
      },
    });
    actions.push({
      id: "events",
      name: t("models.event.plural"),
      shortcut: [],
      keywords: "",
      subtitle: t("app.sidebar.settings"),
      perform: () => {
        router.push(UrlUtils.currentTenantUrl(params, "settings/logs/events"));
      },
    });
  }
  if (appData.myTenants.length > 0) {
    actions.push({
      id: "switch account",
      shortcut: [],
      name: t("app.commands.tenants.switch"),
      keywords: "Go to another account",
      perform: () => {
        router.push("/app");
      },
    });
  }
  actions.push({
    id: "create account",
    shortcut: [],
    name: t("app.commands.tenants.create"),
    keywords: "",
    perform: () => {
      router.push("/new-account");
    },
  });
  if (appData.user?.admin) {
    actions.push({
      id: "switch to admin",
      shortcut: [],
      name: t("admin.switchToAdmin"),
      keywords: "",
      perform: () => {
        router.push("/admin");
      },
    });
  }
  actions.push({
    id: "logout",
    shortcut: [],
    name: t("app.commands.profile.logout"),
    perform: () => {
      router.push("/logout");
    },
  });
  return actions;
}

export default {
  getCommands,
};
