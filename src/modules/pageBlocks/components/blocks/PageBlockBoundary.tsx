"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import ErrorBanner from "@/components/ui/banners/ErrorBanner";
import WarningBanner from "@/components/ui/banners/WarningBanner";
import { PageBlockDto } from "@/modules/pageBlocks/dtos/PageBlockDto";
import StringUtils from "@/lib/shared/StringUtils";

export default function PageBlockBoundary({ item }: { item: PageBlockDto }) {
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  function getType() {
    if (!item) {
      return "Not set";
    }
    const keys = Object.keys(item);
    if (keys.length === 0) {
      throw new Error("Invalid block type");
    }
    return keys[0];
  }
  function hasData() {
    // @ts-ignore
    const block = item[getType()];
    if (block) {
      const keys = Object.keys(block);
      if (keys.find((f) => f === "data")) {
        return true;
      }
    }
    return false;
  }
  function getData() {
    // @ts-ignore
    return item[getType()].data;
  }
  // Don't render anything on server to prevent hydration mismatch
  if (!mounted) {
    return null;
  }
  
  return (
    <>
      {item.error ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <ErrorBanner title={t("shared.error")} text={item.error} />
        </div>
      ) : hasData() && !getData() ? (
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <WarningBanner title={StringUtils.capitalize(getType())} text={"Data is not displayed in edit mode."} />
        </div>
      ) : null}
    </>
  );
}
