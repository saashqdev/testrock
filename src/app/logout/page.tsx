"use client";

import { useEffect } from "react";
import { logoutAction } from "./actions";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <p>Logging out...</p>
    </div>
  );
}
