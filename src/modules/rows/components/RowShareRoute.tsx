"use client";

import { Rows_Share } from "../routes/Rows_Share.server";
import RowSettingsPermissions from "@/components/entities/rows/RowSettingsPermissions";

interface RowShareRouteProps {
  data: Rows_Share.LoaderData;
}

export default function RowShareRoute({ data }: RowShareRouteProps) {
  return <RowSettingsPermissions item={data.rowData.item} items={data.rowData.item.permissions} tenants={data.tenants} users={data.users} withTitle={true} />;
}
