"use client";

import { useEffect } from "react";
import { logoutAction } from "./actions";

export default function LogoutPage() {
  useEffect(() => {
    logoutAction();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging out...</p>
    </div>
  );
}
