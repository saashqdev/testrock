import Image from "next/image";
import { useMounted } from "@/hooks/use-mounted";

export default function EntityIcon({ className, icon, title }: { className?: string; icon?: string; title?: string }) {
  const mounted = useMounted();

  if (!mounted || !icon) {
    return null;
  }

  return (
    <>
      {icon.startsWith("<svg") ? (
        <span
          className={className}
          dangerouslySetInnerHTML={{
            __html: icon
              .replace(/width="[^"]*"/, "")
              .replace(/height="[^"]*"/, "")
              .replace(/<svg/, '<svg style="width: 100%; height: 100%; display: block;"'),
          }}
        />
      ) : icon.includes("http") ? (
        <Image className={className} src={icon!} alt={title ?? ""} width={20} height={20} />
      ) : null}
    </>
  );
}
