import { redirect } from "next/navigation";

// This is an intercepting route that catches navigation to /admin/entities/views/[id]
// It redirects back to the main page with the id preserved in the URL
// The main page's component will detect params.id and show the slideover
export default async function InterceptedEntityViewPage() {
  // This component should never actually render - the parent page handles it
  return null;
}
