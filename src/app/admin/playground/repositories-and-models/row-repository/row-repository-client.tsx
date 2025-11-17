"use client";

import { useTransition } from "react";
import { toast } from "sonner";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import CodeBlock from "@/components/ui/code/CodeBlock";
import InputText from "@/components/ui/input/InputText";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TabsContainer from "@/components/ui/tabs/TabsContainer";
import RowModel from "@/modules/rows/repositories/RowModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";

interface RowRepositoryClientProps {
  company: RowWithDetailsDto | null;
  updateCompanyAction: (formData: FormData) => Promise<{ error?: string; success?: string }>;
}

export default function RowRepositoryClient({ company, updateCompanyAction }: RowRepositoryClientProps) {
  const [isPending, startTransition] = useTransition();
  const companyModel = company ? new RowModel(company) : null;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCompanyAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
      }
    });
  }

  return (
    <EditPageLayout
      withHome={false}
      title="RowRepository Demo"
      menu={[
        { title: "Row Repositories and Models", routePath: "/admin/playground/repositories-and-models" },
        { title: "Repository", routePath: "/admin/playground/entities/repositories-and-models/row-repository" },
      ]}
    >
      <div className="space-y-2">
        <TabsContainer
          items={[
            {
              name: "Explanation",
              render: (
                <div className="prose border-border bg-background rounded-md border p-3">
                  <div>This demo has the following sections:</div>
                  <ol>
                    <li>
                      <b className="underline">loader</b>: Returns <code>Company</code> rows from <code>RowsApi.getAll</code>.
                    </li>
                    <li>
                      <b className="underline">component</b>: Converts <code>RowWithDetails</code> items to <b>RowModel</b> items to use methods like{" "}
                      <code>company.getText(&quot;name&quot;)</code>.
                    </li>
                    <li>
                      <b className="underline">action</b>: Creates a <code>companyRepository</code> and <b>updates</b> the name of the retrieved row.
                    </li>
                  </ol>
                  <div>
                    <div>Before</div>
                    <CodeBlock
                      code={`await RowValueService.update({
  entity,
  row,
  values: [{ name: "name", textValue: "New name" }],
  session,
});`}
                    />
                    <div>After</div>
                    <CodeBlock
                      code={`const companyRepository = new RowRepository(row);
await companyRepository.updateText("name", "New name");`}
                    />
                  </div>
                </div>
              ),
            },
            {
              name: "Code",
              render: <CodeBlock code={code} />,
            },
            {
              name: "Demo",
              render: (
                <div className="border-border bg-background space-y-1 rounded-md border p-3">
                  <h3 className="font-medium">Update First Company</h3>
                  <div className="space-y-1">
                    {!companyModel ? (
                      <div>There are no companies in the database.</div>
                    ) : (
                      <form action={handleSubmit} className="space-y-2">
                        <input type="hidden" name="id" value={companyModel.row.id} hidden readOnly />
                        <InputText name="name" title="Name" defaultValue={companyModel.getText("name")} />
                        <div className="flex justify-end">
                          <LoadingButton type="submit" disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                          </LoadingButton>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              ),
            },
          ]}
        />
      </div>
    </EditPageLayout>
  );
}

const code = `
// imports
...

export const metadata: Metadata = {
  title: \`RowModel | Entity Repositories | \${process.env.APP_NAME}\`,
};

async function getData(props: IServerComponentsProps) {
  await verifyUserHasPermission(props.request!, "admin.entities.view");
  const companies = await RowsApi.getAll({ entity: { name: "company" } });
  return {
    company: companies.items.length > 0 ? companies.items[0] : null,
  };
}

async function updateCompanyAction(formData: FormData) {
  "use server";
  
  const id = formData.get("id")?.toString() ?? "";
  const name = formData.get("name")?.toString() ?? "";
  
  try {
    const { item } = await RowsApi.get(id, { entity: { name: "company" } });
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

// Client Component
"use client";

function RowRepositoryClient({ company, updateCompanyAction }) {
  const [isPending, startTransition] = useTransition();
  const companyModel = company ? new RowModel(company) : null;

  async function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const result = await updateCompanyAction(formData);
      if (result.error) {
        toast.error(result.error);
      } else if (result.success) {
        toast.success(result.success);
      }
    });
  }

  return (
    <div>
      <div className="space-y-1">
        <h3 className="font-medium">Update First Company</h3>
        <div className="space-y-1">
          {!companyModel ? (
            <div>There are no companies in the database.</div>
          ) : (
            <form action={handleSubmit} className="space-y-2">
              <input type="hidden" name="id" value={companyModel.row.id} hidden readOnly />
              <InputText name="name" title="Name" defaultValue={companyModel.getText("name")} />
              <div className="flex justify-end">
                <LoadingButton type="submit" disabled={isPending}>
                  {isPending ? "Saving..." : "Save"}
                </LoadingButton>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
`;
