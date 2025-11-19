import WarningBanner from "@/components/ui/banners/WarningBanner";
import IndexPageLayout from "@/components/ui/layouts/IndexPageLayout";
import CrudExamplesTable from "./CrudExamplesTable";

type CrudExample = {
  title: string;
  files: {
    id: string;
    type: "Route" | "Service" | "DTO" | "Component";
    name: string;
    path: string;
    description: string;
    href?: string;
  }[];
};
const examples: CrudExample[] = [
  {
    title: "Fake Projects",
    files: [
      {
        id: "1",
        type: "Route",
        name: "List",
        path: "app/admin/playground/crud/projects/page.tsx",
        description: "All projects + Search + Pagination + Overview panel",
        href: "/admin/playground/crud/projects",
      },
      {
        id: "2",
        type: "Route",
        name: "Overview",
        path: "app/admin/playground/crud/projects/page.tsx",
        description: "Project overview + Update",
        href: "/admin/playground/crud/projects?id=1",
      },
      {
        id: "3",
        type: "Route",
        name: "Create",
        path: "app/admin/playground/crud/projects/new/page.tsx",
        description: "Create new project",
        href: "/admin/playground/crud/projects/new",
      },
      {
        id: "4",
        type: "Route",
        name: "Edit",
        path: "app/admin/playground/crud/projects/[id]/page.tsx",
        href: "/admin/playground/crud/projects/1",
        description: "Edit project",
      },
      {
        id: "5",
        type: "Component",
        name: "FakeProjectForm",
        path: "app/modules/fake/fakeProjectsCrud/components/FakeProjectForm.tsx",
        description: "Create or Edit project and Tasks + Complete tasks",
      },
      {
        id: "6",
        type: "Component",
        name: "FakeProjectOverview",
        path: "app/modules/fake/fakeProjectsCrud/components/FakeProjectOverview.tsx",
        description: "Overview of project + Complete tasks",
      },
      {
        id: "7",
        type: "Component",
        name: "FakeTasksList",
        path: "app/modules/fake/fakeProjectsCrud/components/FakeTasksList.tsx",
        description: "List of project tasks",
      },
      { id: "8", type: "DTO", name: "FakeProjectDto", path: "app/modules/fake/fakeProjectsCrud/dtos/FakeProjectDto.ts", description: "Project DTO" },
      { id: "9", type: "DTO", name: "FakeTaskDto", path: "app/modules/fake/fakeProjectsCrud/dtos/FakeTaskDto.ts", description: "Task DTO" },
      {
        id: "10",
        type: "Service",
        name: "FakeCrudService",
        path: "app/modules/fake/fakeProjectsCrud/services/FakeCrudService.ts",
        description: "Service to manage projects",
      },
    ],
  },
  {
    title: "Contracts Entity",
    files: [
      {
        id: "11",
        type: "Route",
        name: "List",
        path: "app/admin/playground/crud/contracts/page.tsx",
        description: "All contracts + Search + Pagination + Overview panel",
      },
    ],
  },
];

export default function CrudPage() {
  return (
    <IndexPageLayout title="CRUD examples">
      <WarningBanner title="Warning" text="Data is not saved in the database, created, updated or deleted data is not persisted. This is just for UI and UX." />
      <CrudExamplesTable examples={examples} />
    </IndexPageLayout>
  );
}
