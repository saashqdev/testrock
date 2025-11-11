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
        <div dangerouslySetInnerHTML={{ __html: icon.replace("<svg", `<svg class='${className}'`) ?? "" }} />
      ) : icon.includes("http") ? (
        <Image className={className} src={icon!} alt={title ?? ""} width={20} height={20} />
      ) : null}
    </>
  );
}
