import NewVariableClient from "./NewVariableClient";

export default async function NewVariablePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;

  return <NewVariableClient id={resolvedParams.id} />;
}
