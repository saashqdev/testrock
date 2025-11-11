import { redirect } from "next/navigation";

export default async function PageEditIndexRedirect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/admin/pages/edit/${id}/blocks`);
}
