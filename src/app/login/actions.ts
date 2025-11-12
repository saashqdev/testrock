"use server";

import AuthService from "@/modules/users/services/AuthService";
import { LoginActionData } from "@/modules/users/components/LoginForm";
import { redirect } from "next/navigation";

export async function loginAction(prevState: LoginActionData | null, formData: FormData): Promise<LoginActionData | null> {
  try {
    // Create a mock request object for AuthService
    const request = new Request("http://localhost/login", {
      method: "POST",
      body: formData,
    });

    await AuthService.loginFromRequest(request, formData);
    
    // If loginFromRequest succeeds, it calls redirect() which throws
    // If we reach here, something unexpected happened
    return null;
  } catch (error: any) {
    // Handle redirect thrown by Next.js - let it propagate (this is expected)
    if (error.digest?.startsWith("NEXT_REDIRECT")) {
      throw error;
    }
    
    console.error("Login action error:", error);
    
    // Handle Response.json() errors thrown in loginFromRequest
    if (error instanceof Response) {
      const data = await error.json();
      return data as LoginActionData;
    }
    
    return {
      error: error.message || "An error occurred during login",
    };
  }
}
