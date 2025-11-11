import { useRouter } from "next/navigation";
import { Action } from "kbar";
import { TFunction } from "i18next";
import { getDocCommands } from "@/utils/services/docsService";

interface Props {
  t: TFunction;
  router: ReturnType<typeof useRouter>;
}
function getCommands({ t, router }: Props): Action[] {
  const actions: Action[] = getDocCommands().map((i) => {
    return {
      ...i,
      perform(action) {
        router.push(action.id);
      },
    };
  });
  return actions;
}

export default {
  getCommands,
};
