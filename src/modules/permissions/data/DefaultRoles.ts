import { AdminRoleEnum } from "../enums/AdminRoleEnum";
import { AppRoleEnum } from "../enums/AppRoleEnum";
import { DefaultPermission } from "./DefaultPermission";

export interface CreateRoleDto {
  name: string;
  description: string;
  type: "admin" | "app";
  assignToNewUsers: boolean;
}
export const defaultAdminRoles: CreateRoleDto[] = [
  // /admin
  { name: AdminRoleEnum.SuperAdmin, description: "Has all admin permissions", type: "admin", assignToNewUsers: false },
  { name: AdminRoleEnum.Guest, description: "Views admin pages, but cannot update or delete", type: "admin", assignToNewUsers: true },
];

export const defaultAppRoles: CreateRoleDto[] = [
  // /app
  { name: AppRoleEnum.SuperUser, description: "Has all app permissions", type: "app", assignToNewUsers: false },
  { name: AppRoleEnum.Admin, description: "Has all app permissions but account deletion", type: "app", assignToNewUsers: false },
  { name: AppRoleEnum.User, description: "Has regular permissions", type: "app", assignToNewUsers: true },
];

export interface CreatePermissionDto {
  inRoles: string[];
  name: DefaultPermission;
  description: string;
  type: string;
}
export const defaultPermissions: CreatePermissionDto[] = [
  {
    inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest],
    name: "admin.dashboard.view",
    description: "View dashboard page",
    type: "admin",
  },
  { inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest], name: "admin.accounts.view", description: "View accounts page", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.accounts.create", description: "Create accounts", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest], name: "admin.account.view", description: "View account page", type: "admin" },
  {
    inRoles: [AdminRoleEnum.SuperAdmin],
    name: "admin.account.settings.update",
    description: "Update account settings",
    type: "admin",
  },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.account.users", description: "View account users", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.account.subscription", description: "Update account subscription", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.account.delete", description: "Delete account", type: "admin" },

  { inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest], name: "admin.users.view", description: "View users page", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.users.changePassword", description: "Can change user passwords", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.users.delete", description: "Delete users", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest], name: "admin.roles.view", description: "View roles & permissions page", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.roles.create", description: "Create roles & permissions", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.roles.update", description: "Update role & permission", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.roles.delete", description: "Delete role & permission", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.roles.set", description: "Set user roles", type: "admin" },
  {
    inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest],
    name: "admin.pricing.view",
    description: "View pricing page",
    type: "admin",
  },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.pricing.create", description: "Create plan", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.pricing.update", description: "Update plan", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.pricing.delete", description: "Delete plan", type: "admin" },
  {
    inRoles: [AdminRoleEnum.SuperAdmin, AdminRoleEnum.Guest],
    name: "admin.emails.view",
    description: "View email templates page",
    type: "admin",
  },

  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.general.view", description: "View general settings", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.general.update", description: "Update general settings", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.authentication.view", description: "View authentication settings", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.authentication.update", description: "Update authentication settings", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.analytics.view", description: "View analytics settings", type: "admin" },
  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.analytics.update", description: "Update analytics settings", type: "admin" },

  { inRoles: [AdminRoleEnum.SuperAdmin], name: "admin.settings.danger.reset", description: "Reset settings", type: "admin" },
  {
    inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin, AppRoleEnum.User],
    name: "app.dashboard.view",
    description: "View dashboard page",
    type: "app",
  },
  { inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin], name: "app.settings.members.view", description: "View members page", type: "app" },
  { inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin], name: "app.settings.members.create", description: "Create member", type: "app" },
  { inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin], name: "app.settings.members.update", description: "Update member", type: "app" },
  { inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin], name: "app.settings.members.delete", description: "Delete member", type: "app" },
  {
    inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin],
    name: "app.settings.subscription.view",
    description: "View account's subscription page",
    type: "app",
  },
  {
    inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin],
    name: "app.settings.subscription.update",
    description: "Subscribe to plan",
    type: "app",
  },
  {
    inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin],
    name: "app.settings.subscription.delete",
    description: "Cancel subscription",
    type: "app",
  },
  {
    inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin],
    name: "app.settings.subscription.invoices.view",
    description: "Views invoices",
    type: "app",
  },
  { inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin], name: "app.settings.account.view", description: "View account settings page", type: "app" },
  {
    inRoles: [AppRoleEnum.SuperUser, AppRoleEnum.Admin],
    name: "app.settings.account.update",
    description: "Update account settings",
    type: "app",
  },
  { inRoles: [AppRoleEnum.SuperUser], name: "app.settings.account.delete", description: "Delete account", type: "app" },
];
