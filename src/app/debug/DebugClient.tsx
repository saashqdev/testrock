"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRootData } from "@/lib/state/useRootData";
import { JSONTree } from "react-json-tree";
import HeaderBlock from "@/modules/pageBlocks/components/blocks/marketing/header/HeaderBlock";
import Link from "next/link";

// themes: https://github.com/reduxjs/redux-devtools/tree/75322b15ee7ba03fddf10ac3399881e302848874/src/react/themes
const jsonTreeTheme = {
  scheme: "harmonic16",
  author: "jannik siebert (https://github.com/janniks)",
  base00: "#0b1c2c",
  base01: "#223b54",
  base02: "#405c79",
  base03: "#627e99",
  base04: "#aabcce",
  base05: "#cbd6e2",
  base06: "#e5ebf1",
  base07: "#f7f9fb",
  base08: "#bf8b56",
  base09: "#bfbf56",
  base0A: "#8bbf56",
  base0B: "#56bf8b",
  base0C: "#568bbf",
  base0D: "#8b56bf",
  base0E: "#bf568b",
  base0F: "#bf5656",
};

export default function DebugClient() {
  const rootData = useRootData();
  const searchParams = useSearchParams();
  const router = useRouter();

  function toggleCookies() {
    const newSearchParams = new URLSearchParams(searchParams.toString() || "");
    if (newSearchParams.get("cookies")) {
      newSearchParams.delete("cookies");
    } else {
      newSearchParams.set("cookies", "true");
    }
    router.push(`?${newSearchParams.toString()}`);
  }

  return (
    <div>
      <HeaderBlock />
      <div className="prose p-12">
        <Link href=".">
          <h3 className="text-black dark:text-white">Debug</h3>
        </Link>

        <div>
          <div className="flex justify-between space-x-2">
            <p className="font-medium text-black dark:text-white">Root Data</p>
            <button type="button" className="text-theme-500 underline" onClick={() => toggleCookies()}>
              {searchParams.get("cookies") ? "Hide cookie settings" : "Show cookie settings"}
            </button>
          </div>
          <p className="border-border bg-secondary break-words rounded-md border p-4 text-black dark:bg-gray-800 dark:text-white">
            <div className="hidden dark:block">
              <JSONTree invertTheme={false} data={rootData} theme={jsonTreeTheme} />
            </div>
            <div className="dark:hidden">
              <JSONTree invertTheme={true} data={rootData} theme={jsonTreeTheme} />
            </div>
          </p>
        </div>
      </div>
    </div>
  );
}
