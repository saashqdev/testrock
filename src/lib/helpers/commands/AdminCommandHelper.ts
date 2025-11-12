import { useRouter } from "next/navigation";
import { Action } from "kbar";
import { TFunction } from "i18next";
import { AdminSidebar } from "@/lib/sidebar/AdminSidebar";
import CommandHelper from "./CommandHelper";
import { RootDataDto } from "@/lib/state/useRootData";

interface Props {
  t: TFunction;
  router: ReturnType<typeof useRouter>;
  rootData: RootDataDto;
}
function getCommands({ t, router, rootData }: Props): Action[] {
  const actions: Action[] = CommandHelper.getSidebarCommands({ items: AdminSidebar({ appConfiguration: rootData.appConfiguration }) }).map((i) => {
    return {
      ...i,
      name: t(i.name || ""),
      subtitle: i.subtitle ? t(i.subtitle) : undefined,
      perform(action) {
        router.push(action.id);
      },
    };
  });
  actions.push({
    id: "create account",
    shortcut: [],
    name: t("app.commands.tenants.create"),
    keywords: "",
    perform: () => {
      router.push("/new-account");
    },
  });
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
