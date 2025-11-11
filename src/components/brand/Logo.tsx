import LogoLight from "@/assets/img/logo-light.png";
import LogoDark from "@/assets/img/logo-dark.png";
import clsx from "clsx";
import Link from "next/link";
import Image from "next/image";

interface Props {
  className?: string;
  size?: string;
  to?: string;
  withLink?: boolean;
}

export default function Logo({ className = "", size = "h-9", to, withLink = true }: Props) {
  const images = (
    <>
      <Image className={clsx(size, "mx-auto hidden w-auto dark:block")} src={LogoDark} alt="Logo" />
      <Image className={clsx(size, "mx-auto w-auto dark:hidden")} src={LogoLight} alt="Logo" />
    </>
  );

  if (!withLink) {
    return <div className={clsx(className, "flex")}>{images}</div>;
  }

  return (
    <Link href={to ?? "/"} className={clsx(className, "flex")}>
      {images}
    </Link>
  );
}
