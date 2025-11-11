import { ExternalLinkIcon } from "lucide-react";

interface Props {
  onClick: () => void;
}

export default function MyBillingSession({ onClick }: Props) {
  return (
    <div className="space-y-2">
      <div className="mt-3">
        <button
          type="button"
          onClick={onClick}
          className="focus:outline-hidden relative block w-full rounded-lg border-2 border-dashed border-border p-4 text-center hover:border-border focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          <ExternalLinkIcon className="mx-auto h-4 text-muted-foreground" />
          <span className="mt-2 block text-sm font-medium text-foreground">Open Billing Portal</span>
        </button>
      </div>
    </div>
  );
}
