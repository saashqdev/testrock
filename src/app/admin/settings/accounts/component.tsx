"use client";

import Link from "next/link";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";

export default function AdminSettingsAccounts() {
  return (
    <EditPageLayout
      title="Accounts Settings"
      withHome={false}
      menu={[
        {
          title: "Accounts Settings",
          routePath: "/admin/settings/accounts",
        },
      ]}
    >
      <div className="space-y-3">
        <div className="space-y-2">
          <Link
            href={`types`}
            className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-border focus:ring-2 focus:ring-ring focus:ring-offset-2"
          >
            <span className="mt-2 block text-sm font-medium text-foreground">Types</span>
          </Link>
        </div>
      </div>
    </EditPageLayout>
  );
}
