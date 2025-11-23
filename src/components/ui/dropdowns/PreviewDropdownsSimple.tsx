"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu } from "@headlessui/react";
import clsx from "clsx";
import Dropdown from "./Dropdown";

export default function PreviewDropdownsSimple() {
  const currentRoute = usePathname();
  return (
    <div className="not-prose space-x-2 border border-dashed border-border bg-background p-6">
      <div className="w-full space-y-2">
        <div className="flex justify-between">
          <Dropdown
            right={true}
            onClick={() => alert("Dropdown click")}
            button={<div>Dropdown</div>}
            options={
              <div>
                <Menu.Item>
                  {({ active }) => (
                    <button
                      type="button"
                      onClick={() => alert("Clicked")}
                      className={clsx("w-full text-left", active ? "bg-secondary/90 text-foreground" : "text-foreground/80", "block px-4 py-2 text-sm")}
                    >
                      Button
                    </button>
                  )}
                </Menu.Item>
                <Menu.Item>
                  {({ active }) => (
                    <Link
                      href={currentRoute}
                      className={clsx("w-full", active ? "bg-secondary/90 text-foreground" : "text-foreground/80", "block px-4 py-2 text-sm")}
                    >
                      <div>Link</div>
                    </Link>
                  )}
                </Menu.Item>
              </div>
            }
          ></Dropdown>
          <Dropdown
            onClick={() => alert("Dropdown click")}
            button={<div>Dropdown</div>}
            options={
              <div>
                <button
                  type="button"
                  className="focus:outline-hidden block w-full px-4 py-2 text-left text-sm text-foreground/80 hover:bg-secondary"
                  tabIndex={-1}
                  onClick={() => alert("Clicked")}
                >
                  <div>Button</div>
                </button>
                <Link
                  href={currentRoute}
                  className="focus:outline-hidden block w-full px-4 py-2 text-left text-sm text-foreground/80 hover:bg-secondary"
                  tabIndex={-1}
                >
                  <div>Link</div>
                </Link>
              </div>
            }
          ></Dropdown>
        </div>
      </div>
    </div>
  );
}
