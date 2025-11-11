import { redirect } from "next/navigation";

export default function AdminMetricsPage() {
  // Redirect to the summary page as the default metrics view
  redirect("/admin/metrics/summary");
}
