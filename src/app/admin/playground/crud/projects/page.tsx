import { Metadata } from "next";
import { getPaginationFromCurrentUrl } from "@/lib/helpers/RowPaginationHelper";
import { FakeProjectDto } from "@/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto";
import { FakeProjectService } from "@/modules/fake/fakeProjectsCrud/services/FakeCrudService";
import FakeProjectsClient from "./FakeProjectsClient";

export const metadata: Metadata = {
  title: "Fake Projects",
};

type PageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

async function getData(searchParams: { [key: string]: string | string[] | undefined }) {
  const urlSearchParams = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (value) {
      urlSearchParams.set(key, Array.isArray(value) ? value[0] : value);
    }
  });

  const currentPagination = getPaginationFromCurrentUrl(urlSearchParams);
  const { items, pagination } = await FakeProjectService.getAll({
    filters: {
      name: urlSearchParams.get("name")?.toString(),
    },
    pagination: {
      page: currentPagination.page,
      pageSize: currentPagination.pageSize,
    },
  });

  let overviewItem: FakeProjectDto | null = null;
  const id = urlSearchParams.get("id") ?? "";
  if (id) {
    overviewItem = await FakeProjectService.get(id);
  }

  return {
    items,
    pagination,
    overviewItem,
  };
}

export default async function FakeProjectsPage({ searchParams }: PageProps) {
  const data = await getData(searchParams);

  return <FakeProjectsClient initialData={data} />;
}
