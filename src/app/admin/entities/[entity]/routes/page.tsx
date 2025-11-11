import { getServerTranslations } from "@/i18n/server";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

type LoaderData = {};
export const loader = async (props: IServerComponentsProps) => {
  const data: LoaderData = {};
  return data;
};

type ActionData = {
  error?: string;
};
const badRequest = (data: ActionData) => Response.json(data, { status: 400 });
export const action = async (props: IServerComponentsProps) => {
  const { t } = await getServerTranslations();
  return badRequest({ error: t("shared.invalidForm") });
};

export default function EditEntityIndexRoute() {
  return <div>Routes</div>;
}
