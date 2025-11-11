import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import clsx from "clsx";

interface Props {
  status: string;
  statusToPoll: string;
  intervalInSeconds?: number;
  className?: string;
}
export default function PollButton({ status, statusToPoll, intervalInSeconds = 10, className }: Props) {
  const router = useRouter();
  const [isRefreshing, setIsRefreshing] = useState(false);

  const [countdown, setCountdown] = useState(intervalInSeconds);

  const refreshPage = () => {
    setIsRefreshing(true);
    router.refresh();
    // Reset refreshing state after a short delay
    setTimeout(() => setIsRefreshing(false), 500);
  };

  useEffect(() => {
    let countdownIntervalId: NodeJS.Timeout;
    let refreshIntervalId: NodeJS.Timeout;

    if (status === statusToPoll) {
      setCountdown(intervalInSeconds);
      countdownIntervalId = setInterval(() => {
        setCountdown((currentCountdown) => (currentCountdown > 1 ? currentCountdown - 1 : intervalInSeconds));
      }, 1000);

      refreshIntervalId = setInterval(() => {
        refreshPage();
      }, intervalInSeconds * 1000);
    }

    return () => {
      if (countdownIntervalId) {
        clearInterval(countdownIntervalId);
      }
      if (refreshIntervalId) {
        clearInterval(refreshIntervalId);
      }
    };
  }, [intervalInSeconds, status, statusToPoll]);

  return (
    <div>
      <button
        type="button"
        className={clsx("underline", className)}
        onClick={() => {
          refreshPage();
          setCountdown(intervalInSeconds);
        }}
      >
        {isRefreshing ? "Refreshing..." : <span>Refreshing in {countdown}...</span>}
      </button>
    </div>
  );
}
