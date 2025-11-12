import { SideBarItem } from "./SidebarItem";
import { SvgIcon } from "../enums/shared/SvgIcon";
import { EntityDto } from "@/db/models/entityBuilder/EntitiesModel";
import { EntityGroupWithDetailsDto } from "@/db/models/entityBuilder/EntityGroupsModel";
import { AppConfigurationDto } from "@/db/models/core/AppConfigurationModel";

type Props = {
  tenantId: string;
  entities: EntityDto[];
  entityGroups: EntityGroupWithDetailsDto[];
  appConfiguration: AppConfigurationDto | null;
};

export const AppSidebar = ({ tenantId, entities, entityGroups, appConfiguration }: Props): SideBarItem[] => {
  const currentTenantUrl = `/app/${tenantId}`;

  const sectionItems: SideBarItem[] = [];
  const entitiesItems: SideBarItem[] = [];

  entityGroups.forEach((group) => {
    const item: SideBarItem = {
      title: group.title,
      // icon: group.icon,
      path: `${currentTenantUrl}/g/` + group.slug,
      entityIcon: group.icon,
      // isActive: true,
    };
    if (group.collapsible) {
      item.items = group.entities.map(({ entity }) => {
        return {
          title: entity.titlePlural,
          // icon: entity.icon,
          path: `${currentTenantUrl}/g/${group.slug}/${entity.slug}`,
          // entityIcon: entity.icon,
        };
      });
    }
    if (group.section) {
      const section = sectionItems.find((f) => f.title === group.section);
      if (section) {
        section.items = [...(section.items ?? []), item];
      } else {
        sectionItems.push({
          title: group.section,
          path: ``,
          items: [item],
        });
      }
    } else {
      entitiesItems.push(item);
    }
  });

  entities
    .filter((f) => f.showInSidebar)
    .forEach((entity) => {
      entitiesItems.push({
        title: entity.titlePlural,
        entityIcon: entity.icon,
        // tenantUserTypes: [TenantUserType.OWNER, TenantUserType.ADMIN],
        path: `${currentTenantUrl}/` + entity.slug,
        // permission: getEntityPermission(entity, "view"),
        // side: isDebugMode && SideText({ text: modelProperties.length > 0 ? "DB Model" : "Custom" }),
      });
    });

  const crmEntitiesSidebarItems: SideBarItem[] = [];
  if (appConfiguration?.app.features.tenantEmailMarketing) {
    crmEntitiesSidebarItems.push({
      title: "emailMarketing.title",
      path: `${currentTenantUrl}/email-marketing`,
      icon: SvgIcon.EMAILS,
    });
  }

  const appItem: SideBarItem = {
    title: "",
    path: "",
    items: [
      {
        title: "app.sidebar.dashboard",
        path: `${currentTenantUrl}/dashboard`,
        icon: SvgIcon.DASHBOARD,
        // tenantUserTypes: [TenantUserType.OWNER, TenantUserType.ADMIN, TenantUserType.MEMBER],
      },
      ...entitiesItems,
      ...crmEntitiesSidebarItems,
      // {
      //   title: "models.email.plural",
      //   path: `${currentTenantUrl}/emails`,
      //   icon: SvgIcon.EMAILS,
      // },
    ],
  };
  if (appConfiguration?.app.features.tenantBlogs) {
    appItem?.items?.push({
      title: "blog.title",
      path: `${currentTenantUrl}/blog`,
      icon: SvgIcon.BLOG,
    });
  }
  if (appConfiguration?.app.features.tenantWorkflows) {
    appItem?.items?.push({
      title: "workflows.title",
      path: `${currentTenantUrl}/workflow-engine`,
      icon: SvgIcon.WORKFLOWS,
    });
  }
  if (appConfiguration?.widgets?.enabled) {
    appItem?.items?.push({
      title: "widgets.plural",
      path: `${currentTenantUrl}/widgets`,
      icon: SvgIcon.WIDGETS,
    });
  }

  if (appConfiguration?.portals?.enabled && appConfiguration?.portals?.forTenants) {
    appItem?.items?.push({
      title: "models.portal.plural",
      path: `${currentTenantUrl}/portals`,
      icon: SvgIcon.PORTALS,
    });
  }

  return [
    appItem,
    ...sectionItems,
    {
      title: "",
      path: "",
      isSecondary: true,
      items: [
        {
          title: "app.sidebar.settings",
          icon: SvgIcon.SETTINGS,
          // tenantUserTypes: [TenantUserType.OWNER, TenantUserType.ADMIN],
          path: `${currentTenantUrl}/settings`,
          redirectTo: `${currentTenantUrl}/settings/profile`,
        },
        // {
        //   title: "app.sidebar.logs",
        //   icon: SvgIcon.LOGS,
        //   tenantUserTypes: [TenantUserType.OWNER, TenantUserType.ADMIN],
        //   path: `${currentTenantUrl}/logs`,
        // },
        {
          title: "admin.switchToAdmin",
          path: "/admin/dashboard",
          icon: SvgIcon.ADMIN,
          adminOnly: true,
        },
      ],
    },
    {
      title: "Pricing",
      path: "/pricing",
      isQuickLink: true,
    },
  ];
};

// function SideText({ text }: { text: string }) {
//   return (
//     <div className="inline-flex justify-center space-x-1 items-center px-1.5 py-0.5 rounded-sm text-xs font-medium bg-yellow-100 text-yellow-900 italic truncate w-20">
//       <div className="truncate">{text}</div>
//     </div>
//   );
// }
