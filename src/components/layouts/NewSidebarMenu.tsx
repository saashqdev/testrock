"use client";

import { Fragment, useRef, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import NewTenantSelect from "./selectors/NewTenantSelect";
import { useRootData } from "@/lib/state/useRootData";
import { usePathname, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import { useTitleData } from "@/lib/state/useTitleData";
import OnboardingSession from "@/modules/onboarding/components/OnboardingSession";
import clsx from "clsx";
import Logo from "../brand/Logo";
import { AdminSidebar } from "@/lib/sidebar/AdminSidebar";
import { AppSidebar } from "@/lib/sidebar/AppSidebar";
import { DocsSidebar } from "@/lib/sidebar/DocsSidebar";
import { SidebarGroupDto } from "@/lib/sidebar/SidebarGroupDto";
import { useMounted } from "@/hooks/use-mounted";
import { SideBarItem } from "@/lib/sidebar/SidebarItem";
import UrlUtils from "@/utils/app/UrlUtils";
import SidebarIcon from "./icons/SidebarIcon";
import { useAppData } from "@/lib/state/useAppData";
import { useAdminData } from "@/lib/state/useAdminData";
import { useTranslation } from "react-i18next";
import NewTenantSelector from "./selectors/NewTenantSelector";
import LogoDark from "@/assets/img/logo-dark.png";
import LogoLight from "@/assets/img/logo-light.png";
import NavBar from "./NavBar";

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

interface Props {
  layout: "app" | "admin" | "docs";
  children: React.ReactNode;
  onOpenCommandPalette: () => void;
  menuItems?: SideBarItem[];
}
export default function NewSidebarMenu({ layout, children, onOpenCommandPalette, menuItems }: Props) {
  const { t } = useTranslation();
  const rootData = useRootData();
  const appData = useAppData();
  const adminData = useAdminData();
  const appOrAdminData = useAppOrAdminData();
  const appConfiguration = rootData.appConfiguration;
  const pathname = usePathname();
  const params = useParams();
  const title = useTitleData() ?? "";
  const mounted = useMounted();

  const mainElement = useRef<HTMLElement>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [onboardingModalOpen, setOnboardingModalOpen] = useState(false);

  const getMenuItems = () => {
    let menu: SideBarItem[] = [];
    if (menuItems) {
      menu = menuItems;
    } else if (layout === "admin") {
      menu = AdminSidebar({
        appConfiguration: rootData.appConfiguration
          ? {
              ...rootData.appConfiguration,
              app: {
                ...rootData.appConfiguration.app,
                theme: {
                  color: rootData.theme.color,
                  scheme: rootData.theme.scheme as "light" | "dark" | "system",
                },
              },
            }
          : null,
        myTenants: appOrAdminData?.myTenants,
      });
    } else if (layout === "app") {
      menu = AppSidebar({
        tenantId: Array.isArray(params.tenant) ? (params.tenant[0] ?? "") : (params.tenant ?? ""),
        entities: appData?.entities ?? [],
        entityGroups: appData?.entityGroups ?? [],
        appConfiguration: rootData.appConfiguration
          ? {
              ...rootData.appConfiguration,
              app: {
                ...rootData.appConfiguration.app,
                theme: {
                  color: rootData.theme.color,
                  scheme: rootData.theme.scheme as "light" | "dark" | "system",
                },
              },
            }
          : null,
      });
    } else if (layout === "docs") {
      menu = DocsSidebar();
    }

    function clearItemsIfNotCollapsible(items: SideBarItem[]) {
      items.forEach((item) => {
        if (item.isCollapsible !== undefined && !item.isCollapsible) {
          item.items = [];
        }
        if (item.items) {
          clearItemsIfNotCollapsible(item.items);
        }
      });
    }
    clearItemsIfNotCollapsible(menu);

    menu.forEach((item) => {
      if (item.isCollapsible !== undefined && !item.isCollapsible) {
        item.items = [];
      }
      item.items?.forEach((subitem) => {
        if (subitem.isCollapsible !== undefined && !subitem.isCollapsible) {
          subitem.items = [];
        }
      });
    });
    // setMenu(layout === "admin" ? AdminSidebar : );
    menu.forEach((group) => {
      group.items?.forEach((element) => {
        if (element.open || isCurrent(element) || currentIsChild(element)) {
          // expanded.push(element.path);
        } else {
          // setExpanded(expanded.filter((f) => f !== element.path));
        }
      });
    });

    return menu || [];
  };

  const [expanded, setExpanded] = useState<string[]>([]);

  function menuItemIsExpanded(path: string) {
    return expanded.includes(path);
  }
  function toggleMenuItem(path: string) {
    if (expanded.includes(path)) {
      setExpanded(expanded.filter((item) => item !== path));
    } else {
      setExpanded([...expanded, path]);
    }
  }
  function getPath(item: SideBarItem) {
    return UrlUtils.replaceVariables(params, item.path) ?? "";
  }
  function isCurrent(menuItem: SideBarItem) {
    if (menuItem.path) {
      if (menuItem.exact) {
        return pathname === getPath(menuItem);
      }
      return pathname?.includes(getPath(menuItem));
    }
  }
  function currentIsChild(menuItem: SideBarItem) {
    let hasOpenChild = false;
    menuItem.items?.forEach((item) => {
      if (isCurrent(item)) {
        hasOpenChild = true;
      }
    });
    return hasOpenChild;
  }
  function allowCurrentUserType(item: SideBarItem) {
    if (!item.adminOnly) {
      return true;
    }
    return appData?.user?.admin !== null;
  }
  function allowCurrentTenantUserType(item: SideBarItem) {
    return !item.tenantUserTypes || (appData?.currentRole !== undefined && item.tenantUserTypes.includes(appData.currentRole));
  }
  function checkUserRolePermissions(item: SideBarItem) {
    return !item.permission || appData?.permissions?.includes(item.permission) || adminData?.permissions?.includes(item.permission);
  }
  function checkFeatureFlags(item: SideBarItem) {
    return !item.featureFlag || rootData.featureFlags?.includes(item.featureFlag);
  }
  const getMenu = (): SidebarGroupDto[] => {
    function filterItem(f: SideBarItem) {
      return f.hidden !== true && allowCurrentUserType(f) && allowCurrentTenantUserType(f) && checkUserRolePermissions(f) && checkFeatureFlags(f);
    }
    const _menu: SidebarGroupDto[] = [];
    getMenuItems()
      .filter((f) => filterItem(f))
      .forEach(({ title, items }) => {
        _menu.push({
          title: title.toString(),
          items:
            items
              ?.filter((f) => filterItem(f))
              .map((f) => {
                return {
                  ...f,
                  items: f.items?.filter((f) => filterItem(f)),
                };
              }) ?? [],
        });
      });
    return _menu.filter((f) => f.items.length > 0);
  };

  function onSelected() {
    setSidebarOpen(false);
  }

  return (
    <>
      <div>
        <OnboardingSession open={onboardingModalOpen} setOpen={setOnboardingModalOpen} />

        <Dialog
          open={sidebarOpen}
          onClose={setSidebarOpen}
          className={clsx(
            "relative z-50 text-foreground lg:hidden",

            layout === "admin" ? "dark" : "dark"
          )}
        >
          <Dialog.Backdrop className="data-closed:opacity-0 fixed inset-0 bg-foreground/50 transition-opacity duration-300 ease-linear" />

          <div className="fixed inset-0 flex">
            <Dialog.Panel className="data-closed:-translate-x-full relative mr-16 flex w-full max-w-xs flex-1 transform transition duration-300 ease-in-out">
              <Transition.Child>
                <div className="data-closed:opacity-0 absolute left-full top-0 flex w-16 justify-center pt-5 duration-300 ease-in-out">
                  <button type="button" onClick={() => setSidebarOpen(false)} className="-m-2.5 p-2.5">
                    <span className="sr-only">Close sidebar</span>
                    <XMarkIcon aria-hidden="true" className="h-6 w-6 text-white" />
                  </button>
                </div>
              </Transition.Child>
              {/* Sidebar component, swap this element with another sidebar if you like */}
              <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-background px-6 pb-4 ring-1 ring-white/10">
                <div className="flex h-16 shrink-0 items-center">
                  {/* <img alt="Your Company" src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=500" className="h-8 w-auto" /> */}

                  <Logo size="h-8 p-1 w-auto" />
                </div>
                <nav className="flex flex-1 flex-col">
                  {layout === "app" && (
                    <div>{appData?.currentTenant && <NewTenantSelector key={Array.isArray(params.tenant) ? params.tenant.join(",") : params.tenant} />}</div>
                  )}

                  {getMenu().map((group, index) => {
                    return (
                      <div key={index} className="space-y-1">
                        <div id={group.title} className="mt-1">
                          <h3 className="px-1 text-xs font-medium uppercase leading-4 tracking-wider text-muted-foreground">{t(group.title || "")}</h3>
                        </div>
                        {group.items.map((menuItem, index) => {
                          return (
                            <Link
                              key={index}
                              id={UrlUtils.slugify(getPath(menuItem))}
                              href={menuItem.redirectTo ?? getPath(menuItem)}
                              className={clsx(
                                isCurrent(menuItem)
                                  ? "bg-secondary text-primary dark:text-secondary-foreground"
                                  : "text-secondary-foreground/70 hover:bg-secondary hover:text-secondary-foreground",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                              )}
                              onClick={onSelected}
                            >
                              {mounted && (menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && (
                                <SidebarIcon className="h-5 w-5" item={menuItem} />
                              )}
                              <div>{t(menuItem.title)}</div>
                            </Link>
                          );
                        })}
                      </div>
                    );
                  })}
                  <ul role="list" className="flex flex-1 flex-col gap-y-7">
                    {/* <li>
                      <ul role="list" className="-mx-2 space-y-1">
                        {navigation.map((item) => (
                          <li key={item.name}>
                            <a
                              href={item.href}
                              className={classNames(
                                item.current ? "bg-foreground/90 text-white" : "text-muted-foreground hover:bg-foreground/90 hover:text-white",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                              )}
                            >
                              <item.icon aria-hidden="true" className="h-6 w-6 shrink-0" />
                              {item.name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li> */}
                    {/* <li>
                      <div className="text-xs font-medium leading-6 text-muted-foreground">Your teams</div>
                      <ul role="list" className="-mx-2 mt-2 space-y-1">
                        {teams.map((team) => (
                          <li key={team.name}>
                            <a
                              href={team.href}
                              className={classNames(
                                team.current ? "bg-foreground/90 text-white" : "text-muted-foreground hover:bg-foreground/90 hover:text-white",
                                "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                              )}
                            >
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-foreground/90 text-[0.625rem] font-medium text-muted-foreground group-hover:text-white">
                                {team.initial}
                              </span>
                              <span className="truncate">{team.name}</span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    </li> */}
                    <li className="mt-auto">
                      {layout == "app" && <NewTenantSelect onOpenCommandPalette={onOpenCommandPalette} />}
                      {/* <a
                        href="#"
                        className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm leading-5 text-muted-foreground hover:bg-foreground/90 hover:text-white"
                      >
                        <Cog6ToothIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                        Settings
                      </a> */}
                    </li>
                  </ul>
                </nav>
              </div>
            </Dialog.Panel>
          </div>
        </Dialog>

        {/* Static sidebar for desktop */}
        <div
          className={clsx(
            "hidden text-foreground lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col",

            layout === "admin" ? "dark" : "dark"
          )}
        >
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="shadow-2xs flex grow flex-col overflow-y-auto border-r border-border bg-background px-6 pb-4 dark:border-r-0">
            <div className="flex h-16 shrink-0 items-center justify-center border-b border-transparent">
              <Link href={"/"}>
                {/* <Logo size="h-8 p-1 w-auto" /> */}
                <Image
                  className={"mx-auto hidden h-10 w-auto p-1 dark:flex"}
                  src={appConfiguration.branding.logoDarkMode || appConfiguration.branding.logo || LogoDark}
                  alt="Logo"
                />
                <Image
                  className={"mx-auto h-10 w-auto p-1 dark:hidden"}
                  src={appConfiguration.branding.logoDarkMode || appConfiguration.branding.logo || LogoLight}
                  alt="Logo"
                />
              </Link>
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {layout === "app" && (
                      <div>{appData?.currentTenant && <NewTenantSelector key={Array.isArray(params.tenant) ? params.tenant.join(",") : params.tenant} />}</div>
                    )}

                    {getMenu().map((group, index) => {
                      return (
                        <div key={index} className="select-none">
                          <div className="mt-2">
                            <h3 id="Group-headline" className="px-1 text-xs font-medium uppercase leading-4 tracking-wider text-muted-foreground">
                              {t(group.title || "")}
                            </h3>
                          </div>
                          {group.items.map((menuItem, index) => {
                            return (
                              <div key={index}>
                                {(() => {
                                  if (!menuItem.items || menuItem.items.length === 0) {
                                    return (
                                      <Link
                                        id={UrlUtils.slugify(getPath(menuItem))}
                                        href={menuItem.redirectTo ?? getPath(menuItem)}
                                        className={clsx(
                                          "focus:outline-hidden group mt-1 flex items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out",
                                          menuItem.icon !== undefined && "px-4",
                                          isCurrent(menuItem)
                                            ? "bg-secondary text-primary dark:text-secondary-foreground"
                                            : "text-secondary-foreground/70 hover:bg-secondary hover:text-secondary-foreground",
                                          "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                                        )}
                                        onClick={onSelected}
                                      >
                                        <div className="flex items-center space-x-5">
                                          {mounted && (menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && (
                                            <SidebarIcon className="h-5 w-5" item={menuItem} />
                                          )}
                                          <div>{t(menuItem.title)}</div>
                                        </div>
                                        {menuItem.side}
                                      </Link>
                                    );
                                  } else {
                                    return (
                                      <div>
                                        <button
                                          type="button"
                                          className={clsx(
                                            "focus:outline-hidden group mt-1 flex w-full items-center justify-between truncate rounded-sm px-4 py-2 text-sm leading-5 transition duration-150 ease-in-out",
                                            menuItem.icon !== undefined && "px-4",
                                            isCurrent(menuItem)
                                              ? "bg-secondary text-primary dark:text-secondary-foreground"
                                              : "text-secondary-foreground/70 hover:bg-secondary hover:text-secondary-foreground",
                                            "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                                          )}
                                          onClick={() => toggleMenuItem(menuItem.path)}
                                        >
                                          <div className="flex items-center space-x-5 truncate">
                                            {mounted && (menuItem.icon !== undefined || menuItem.entityIcon !== undefined) && (
                                              <SidebarIcon className="h-5 w-5" item={menuItem} />
                                            )}
                                            <div className="truncate">{t(menuItem.title)}</div>
                                          </div>
                                          {/*Expanded: "text-muted-foreground rotate-90", Collapsed: "text-slate-200" */}

                                          {menuItem.side ?? (
                                            <svg
                                              className={clsx(
                                                "ml-auto h-5 w-5 shrink-0 transform transition-colors duration-150 ease-in-out",
                                                menuItemIsExpanded(menuItem.path)
                                                  ? "ml-auto h-3 w-3 rotate-90 transform transition-colors duration-150 ease-in-out"
                                                  : "ml-auto h-3 w-3 transform transition-colors duration-150 ease-in-out"
                                              )}
                                              viewBox="0 0 20 20"
                                            >
                                              <path d="M6 6L14 10L6 14V6Z" fill="currentColor" />
                                            </svg>
                                          )}
                                        </button>

                                        {/*Expandable link section, show/hide based on state. */}
                                        {menuItemIsExpanded(menuItem.path) && (
                                          <div className="mt-1">
                                            {menuItem.items.map((subItem, index) => {
                                              return (
                                                <Fragment key={index}>
                                                  <Link
                                                    id={UrlUtils.slugify(getPath(subItem))}
                                                    href={subItem.redirectTo ?? getPath(subItem)}
                                                    className={clsx(
                                                      "focus:outline-hidden group mt-1 flex items-center rounded-sm py-2 text-sm leading-5 transition duration-150 ease-in-out",
                                                      menuItem.icon === undefined && "pl-10",
                                                      menuItem.icon !== undefined && "pl-14",
                                                      isCurrent(menuItem)
                                                        ? "bg-secondary text-primary dark:text-secondary-foreground"
                                                        : "text-secondary-foreground/70 hover:bg-secondary hover:text-secondary-foreground",
                                                      "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                                                    )}
                                                    onClick={onSelected}
                                                  >
                                                    {mounted && (subItem.icon !== undefined || subItem.entityIcon !== undefined) && (
                                                      <SidebarIcon className="h-5 w-5" item={subItem} />
                                                    )}
                                                    <div>{t(subItem.title)}</div>
                                                  </Link>
                                                </Fragment>
                                              );
                                            })}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  }
                                })()}
                              </div>
                            );
                          })}
                        </div>
                      );
                    })}
                    {/* {navigation.map((item) => (
                      <li key={item.name}>
                        <a
                          href={item.href}
                          className={classNames(
                            item.current ? " bg-secondary text-primary dark:text-secondary-foreground" : "hover:text-primary text-muted-foreground hover:bg-secondary",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                          )}
                        >
                          <item.icon
                            aria-hidden="true"
                            className={classNames(item.current ? "text-primary" : "group-hover:text-primary text-muted-foreground", "h-6 w-6 shrink-0")}
                          />
                          {item.name}
                        </a>
                      </li>
                    ))} */}
                  </ul>
                </li>
                {/* <li>
                  <div className="text-xs font-medium leading-6 text-muted-foreground">Your teams</div>
                  <ul role="list" className="-mx-2 mt-2 space-y-1">
                    {teams.map((team) => (
                      <li key={team.name}>
                        <a
                          href={team.href}
                          className={classNames(
                            team.current ? "bg-foreground/90 text-white" : "text-muted-foreground hover:bg-foreground/90 hover:text-white",
                            "group flex gap-x-3 rounded-md p-2 text-sm leading-5"
                          )}
                        >
                          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg border border-gray-700 bg-foreground/90 text-[0.625rem] font-medium text-muted-foreground group-hover:text-white">
                            {team.initial}
                          </span>
                          <span className="truncate">{team.name}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </li> */}
                <li className="mt-auto">
                  {layout == "app" && <NewTenantSelect onOpenCommandPalette={onOpenCommandPalette} />}

                  {/* <a
                    href="#"
                    className="group -mx-2 flex gap-x-3 rounded-md p-2 text-sm leading-5 text-muted-foreground hover:bg-foreground/90 hover:text-white"
                  >
                    <Cog6ToothIcon aria-hidden="true" className="h-6 w-6 shrink-0" />
                    Settings
                  </a> */}
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:pl-64">
          <div className="shadow-2xs sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background px-4 sm:gap-x-6 sm:px-6 lg:px-8">
            <button type="button" onClick={() => setSidebarOpen(true)} className="-m-2.5 p-2.5 text-muted-foreground lg:hidden">
              <span className="sr-only">Open sidebar</span>
              <Bars3Icon aria-hidden="true" className="h-6 w-6" />
            </button>

            {/* Separator */}
            <div aria-hidden="true" className="h-6 w-px bg-foreground/10 lg:hidden" />

            <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
              <NavBar
                layout={layout}
                title={title}
                buttons={{
                  mySubscription: getUserHasPermission(appOrAdminData, "app.settings.subscription.update"),
                  feedback: rootData.appConfiguration.app.features.tenantFeedback,
                  chatSupport: !!rootData.chatWebsiteId,
                  quickActions: (appOrAdminData?.entities?.filter((f) => f.showInSidebar)?.length ?? 0) > 0,
                  search: true,
                  notifications: appConfiguration?.notifications?.enabled && (layout === "admin" || layout === "app"),
                  onboarding: appConfiguration?.onboarding?.enabled ?? false,
                  userProfile: true,
                }}
                onOpenCommandPalette={onOpenCommandPalette}
                onOpenOnboardingModal={() => setOnboardingModalOpen(true)}
              />
            </div>
          </div>

          <main ref={mainElement} className="focus:outline-hidden flex-1 bg-secondary/50" tabIndex={0}>
            <div key={Array.isArray(params.tenant) ? params.tenant.join(",") : params.tenant} className="pb-20 sm:pb-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
