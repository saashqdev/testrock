"use client";

import Link from "next/link";
import clsx from "clsx";
import { Fragment, ReactNode } from "react";
import { Button } from "../button";

interface Props {
  type?: "button" | "submit";
  to: string | undefined;
  children: ReactNode;
  className?: string;
  target?: undefined | "_blank" | string;
  role?: string;
  rel?: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement>) => void;
  autoFocus?: boolean;
  disabled?: boolean;
  isLoading?: boolean;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement | HTMLAnchorElement | HTMLDivElement>) => void;
}
export default function LinkOrAhref({
  type = "button",
  to,
  target,
  children,
  className,
  role,
  rel,
  onClick,
  autoFocus,
  disabled,
  isLoading,
  onMouseEnter,
  onMouseLeave,
}: Props) {
  // Normalize the 'to' prop to ensure consistent behavior across server/client
  const hasDestination = to !== undefined && to !== null && to !== "";
  const isDisabled = disabled || (!hasDestination && !onClick);

  if (isDisabled) {
    return (
      <div className={className} role={role} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        {children}
      </div>
    );
  }

  if (!hasDestination) {
    return (
      <Button
        type={type}
        onClick={onClick}
        className={clsx(className, isLoading && "base-spinner cursor-not-allowed")}
        role={role}
        autoFocus={autoFocus}
        disabled={disabled}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
      >
        {children}
      </Button>
    );
  }

  return (
    <Link onClick={onClick} href={to} target={target} className={className} role={role} rel={rel} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
      {children}
    </Link>
  );
}
