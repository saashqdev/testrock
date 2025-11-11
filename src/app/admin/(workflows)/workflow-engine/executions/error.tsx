"use client";

import ServerError from "@/components/ui/errors/ServerError";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <ServerError />;
}
