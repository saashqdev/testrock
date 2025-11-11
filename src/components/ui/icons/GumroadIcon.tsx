import clsx from "clsx";
import Logo from "@/assets/logos/colors/gumroad.png";
import Image from "next/image";

export default function GumroadIcon({ className }: { className?: string }) {
  return <Image className={clsx("object-cover", className)} src={Logo} alt="Gumroad" />;
}
