import { Metadata } from "next";
import CodeBlock from "@/components/ui/code/CodeBlock";
import DateCell from "@/components/ui/dates/DateCell";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import TableSimple from "@/components/ui/tables/TableSimple";
import TabsContainer from "@/components/ui/tabs/TabsContainer";
import RowController from "@/modules/rows/repositories/RowModel";
import { RowsApi } from "@/utils/api/server/RowsApi";
import ServerError from "@/components/ui/errors/ServerError";
import "highlight.js/styles/night-owl.css";
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { headers } from "next/headers";
import Image from "next/image";

export const metadata: Metadata = {
  title: `RowModel | Entity Repositories | ${process.env.APP_NAME}`,
};

async function getData() {
  const headersList = await headers();
  const request = new Request("http://localhost", { headers: headersList });
  
  await verifyUserHasPermission("admin.entities.view");
  
  const companies = await RowsApi.getAll({ entity: { name: "company" } });
  return { companies };
}

export default async function RowModelPage() {
  const data = await getData();
  const companies = data.companies.items.map((item) => {
    return new RowController(item);
  });
  return (
    <EditPageLayout
      withHome={false}
      title="RowModel Demo"
      menu={[
        { title: "Row Repositories and Models", routePath: "/admin/playground/repositories-and-models" },
        { title: "Model", routePath: "/admin/playground/entities/repositories-and-models/row-model" },
      ]}
    >
      <TabsContainer
        items={[
          {
            name: "Explanation",
            render: (
              <div className="prose border-border bg-background rounded-md border p-3">
                <div>This demo has the following sections:</div>
                <ol>
                  <li>
                    <b className="underline">getData</b>: Async function that returns <code>Company</code> rows from <code>RowsApi.getAll</code>.
                  </li>
                  <li>
                    <b className="underline">component</b>: Server Component that fetches data and converts the <code>RowWithDetails</code> items to <b>RowModel</b> to use methods like{" "}
                    <code>company.getText(&quot;name&quot;)</code>.
                  </li>
                </ol>
                <div>
                  <div>Before</div>
                  <CodeBlock code={`const name = RowValueHelper.getText({ entity, row, name: "name" });`} />
                  <div>After</div>
                  <CodeBlock code={`const name = company.getText("name");`} />
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
              <div className="border-border bg-background rounded-md border p-3">
                <TableSimple
                  items={companies}
                  headers={[
                    { name: "name", title: "Name", value: (i) => i.getText("name") },
                    {
                      name: "logo",
                      title: "Logo",
                      value: (i) => {
                        const logo = i.getMediaPublicUrlOrFile("logo");
                        if (!logo) {
                          return null;
                        }
                        return <Image alt={i.toString()} className="h-8 w-auto" src={i.getMediaPublicUrlOrFile("logo") ?? ""} title={i.getText("title")} width={32} height={32} />;
                      },
                    },
                    { name: "createdAt", title: "Created at", value: (i) => <DateCell date={i.row.createdAt} /> },
                    { name: "toString", title: "toString()", value: (i) => i.toString() },
                  ]}
                />
              </div>
            ),
          },
        ]}
      />
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}

const code = `
// imports
...

export const metadata: Metadata = {
  title: \`RowModel | Entity Repositories | \${process.env.APP_NAME}\`,
};

async function getData() {
  const headersList = await headers();
  const request = new Request("http://localhost", { headers: headersList });
  
  await verifyUserHasPermission("admin.entities.view");
  
  const companies = await RowsApi.getAll({ entity: { name: "company" } });
  return { companies };
}

export default async function RowModelPage() {
  const data = await getData();
  const companies = data.companies.items.map((item) => {
    return new RowController(item);
  });
  return (
    <TableSimple
      items={companies}
      headers={[
        { name: "name", title: "Name", value: (i) => i.getText("name") },
        {
          name: "logo",
          title: "Logo",
          value: (i) => {
            const logo = i.getMediaPublicUrlOrFile("logo");
            if (!logo) {
              return null;
            }
            return <img alt={i.toString()} className="h-8 w-auto" src={i.getMediaPublicUrlOrFile("logo")} title={i.getText("title")} />;
          },
        },
        { name: "createdAt", title: "Created at", value: (i) => <DateCell date={i.row.createdAt} /> },
        { name: "toString", title: "toString()", value: (i) => i.toString() },
      ]}
    />
  );
}
`;
