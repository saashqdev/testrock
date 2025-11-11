import FakeRowsPage from "./FakeRowsClient";
import { loadData } from "./actions";

export default async function Page() {
  const initialData = await loadData();
  return <FakeRowsPage initialData={initialData} />;
}
