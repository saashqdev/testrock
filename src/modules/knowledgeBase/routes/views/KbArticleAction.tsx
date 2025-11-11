"use client";

import { useState } from "react";

export function KbArticleAction() {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function onAction(name: string) {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      const form = new FormData();
      form.set("action", name);

      const response = await fetch(window.location.pathname, {
        method: "POST",
        body: form,
      });

      if (response.ok) {
        // Optionally refresh the page or update UI
        window.location.reload();
      }
    } catch (error) {
      console.error("Action failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  }

  return { onAction, isSubmitting };
}
