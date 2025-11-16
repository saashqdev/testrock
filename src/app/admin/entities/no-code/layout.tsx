import { ReactNode } from "react";
import ServerError from "@/components/ui/errors/ServerError";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";

export default function NoCodeLayout({ children }: { children: ReactNode }) {
  return (
    <EditPageLayout title={`No-code Routes & Blocks`} menu={[{ title: "No-code", routePath: "/admin/entities/no-code" }]} withHome={false}>
      <div className="border-border h-[calc(100vh-200px)] overflow-y-auto rounded-lg border-2 border-dashed sm:h-[calc(100vh-160px)]">
        {children}
      </div>
    </EditPageLayout>
  );
}

export function ErrorBoundary() {
  return <ServerError />;
}
