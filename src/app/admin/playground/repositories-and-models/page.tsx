import { Metadata } from "next";
import Link from "next/link";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";

export const metadata: Metadata = {
  title: `Row Repositories and Models | ${process.env.APP_NAME}`,
};

export default function RepositoriesAndModelsPage() {
  return (
    <EditPageLayout title="Row Repositories and Models">
      <p className="text-muted-foreground text-sm">
        This page is a demo collection for <b>RowRepository</b> and <b>RowModel</b>.
      </p>
      <div className="grid gap-3">
        <Link
          href="/admin/playground/repositories-and-models/row-repository"
          className="hover:bg-secondary border-border bg-background group space-y-2 rounded-md border-2 border-dashed p-3 hover:border-dotted"
        >
          <b className="text-foreground font-bold group-hover:underline">RowRepository</b>
          <p className="text-sm">
            <b>Server-side</b> repository for an entity type. It has the following methods:
          </p>
          <div className="border-border bg-secondary/90 rounded-md border p-1">
            <span className="text-xs">
              <code>updateMany</code>, <code>updateText</code>, <code>updateNumber</code>, <code>updateBoolean</code>, <code>updateDate</code>,{" "}
              <code>updateMedia</code>, <code>updateMultiple</code>, <code>updateRange</code>, <code>addChild</code>, <code>removeChild</code>,{" "}
              <code>addParent</code>, <code>removeParent</code>
            </span>
          </div>
          <div className="prose">
            <pre>{`await company.updateText("status", "active");`}</pre>
          </div>
        </Link>
        <Link
          href="/admin/playground/repositories-and-models/row-model"
          className="hover:bg-secondary border-border bg-background group space-y-2 rounded-md border-2 border-dashed p-3 hover:border-dotted"
        >
          <b className="text-foreground font-bold group-hover:underline">RowModel</b>
          <p className="text-sm">
            <b>Client and server-side</b> model to interact with a row. It has the following methods:
          </p>
          <div className="border-border bg-secondary/90 rounded-md border p-1">
            <span className="text-xs">
              <code>getText</code>, <code>getBoolean</code>, <code>getNumber</code>, <code>getDate</code>, <code>getMedia</code>, <code>getFirstMedia</code>,{" "}
              <code>getMediaPublicUrl</code>, <code>getMediaPublicUrlOrFile</code>, <code>getSelected</code>, <code>getMultiple</code>,{" "}
              <code>getNumberRange</code>, <code>getDateRange</code>
            </span>
          </div>
          <div className="prose">
            <pre>{`const status = company.getText("status");`}</pre>
          </div>
        </Link>
      </div>
    </EditPageLayout>
  );
}
