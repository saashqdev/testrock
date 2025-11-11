"use server";

import { redirect } from "next/navigation";
import AuthService from "@/modules/users/services/AuthService";

export async function verifyAction(formData: FormData, id: string) {
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const company = formData.get("company") as string;
    const firstName = formData.get("firstName") as string;
    const lastName = formData.get("lastName") as string;
    const slug = formData.get("slug") as string;

    // Create a mock request object for AuthService
    const mockRequest = {
      formData: async () => formData,
    } as Request;

    const response = await AuthService.verifyFromRequest({
      request: mockRequest,
      params: { id },
    });

    // Check if response exists
    if (!response) {
      redirect("/login");
      return;
    }

    // Check if the response is a redirect (success case)
    if (response.status === 302 || response.headers.get("Location")) {
      const location = response.headers.get("Location");
      if (location) {
        redirect(location);
      }
    }

    // Handle error case
    if (response.status !== 200) {
      const result = await response.json();
      // Redirect back with error and field data
      const fields = JSON.stringify({
        email,
        password,
        company,
        firstName,
        lastName,
        slug,
      });
      redirect(`/verify/${id}?error=${encodeURIComponent(result.error)}&fields=${encodeURIComponent(fields)}`);
    }

    // On success, redirect to appropriate page (you may need to adjust this)
    redirect("/login");
  } catch (error) {
    console.error("Verification error:", error);
    redirect(`/verify/${id}?error=${encodeURIComponent("An unexpected error occurred")}`);
  }
}
