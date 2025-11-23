import { Metadata } from "next";
import { getAll, get } from "@/utils/api/server/RowsApi";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";
import RowRepository from "@/modules/rows/repositories/RowRepository.server";
import { loadEntities } from "@/modules/rows/repositories/server/EntitiesSingletonService";
import RowRepositoryClient from "./row-repository-client";
import "highlight.js/styles/night-owl.css";

export const metadata: Metadata = {
  title: `RowModel | Entity Repositories | ${process.env.APP_NAME}`,
};

async function getData(props: IServerComponentsProps) {
  const request = props.request!;
  await verifyUserHasPermission("admin.entities.view");
  const companies = await getAll({ entity: { name: "company" } });
  return {
    company: companies.items.length > 0 ? companies.items[0] : null,
  };
}

async function updateCompanyAction(formData: FormData) {
  "use server";

  const id = formData.get("id")?.toString() ?? "";
  const name = formData.get("name")?.toString() ?? "";

  try {
    const { item } = await get(id, { entity: { name: "company" } });
    await loadEntities();
    const companyRepository = new RowRepository(item);
    await companyRepository.updateText("name", name);
    return { success: "Company name updated successfully." };
  } catch (e: any) {
    return { error: e.message };
  }
}

export default async function RowRepositoryPage(props: IServerComponentsProps) {
  const data = await getData(props);

  return <RowRepositoryClient company={data.company} updateCompanyAction={updateCompanyAction} />;
}
