import { redirect } from "next/navigation";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function EntityViewPage(props: IServerComponentsProps) {
  const params = await props.params;
  const searchParams = await props.searchParams;
  
  // Build query string preserving any existing params
  const queryParams = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach(v => queryParams.append(key, v));
        } else {
          queryParams.append(key, value);
        }
      }
    });
  }
  
  // Add the edit parameter
  queryParams.set("edit", params.id);
  
  // Redirect to the views page with edit parameter to trigger slideover
  throw redirect(`/admin/entities/views?${queryParams.toString()}`);
}
