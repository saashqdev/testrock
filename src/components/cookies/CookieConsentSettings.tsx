"use client";

import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { allCookieCategories } from "@/lib/cookies/ApplicationCookies";
import { CookieCategory } from "@/lib/cookies/CookieCategory";
import { useRootData } from "@/lib/state/useRootData";
import CookieHelper from "@/lib/helpers/CookieHelper";
import CookiesList from "./CookiesList";
import { Button } from "../ui/button";

interface Props {
  onUpdated?: () => void;
}
export default function CookieConsentSettings({ onUpdated }: Props) {
  const { t } = useTranslation();
  let { userSession } = useRootData();
  const router = useRouter();
  let pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedCookies, setSelectedCookies] = useState<CookieCategory[]>([]);

  useEffect(() => {
    const initial: CookieCategory[] = [];
    allCookieCategories.forEach((cookie) => {
      if (userSession.cookies.find((f) => f.allowed && f.category === CookieCategory[cookie])) {
        initial.push(cookie);
      }
    });
    setSelectedCookies(initial);
  }, [userSession.cookies]);

  function setCookies(selectedCookies: CookieCategory[]) {
    const form = CookieHelper.getUpdateCookieConsentForm({ selectedCookies, pathname, searchParams });
    
    // Create a form element and submit it
    const formElement = document.createElement('form');
    formElement.method = 'POST';
    formElement.action = '/';
    formElement.style.display = 'none';
    
    // Add form data as hidden inputs
    if (form instanceof FormData) {
      for (const [key, value] of form.entries()) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = typeof value === 'string' ? value : value.name || '';
        formElement.appendChild(input);
      }
    } else {
      // If form is an object, convert to hidden inputs
      Object.entries(form).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value != null ? String(value) : '';
        formElement.appendChild(input);
      });
    }
    
    document.body.appendChild(formElement);
    formElement.submit();
    document.body.removeChild(formElement);
    
    if (onUpdated) {
      onUpdated();
    }
  }

  function toggle(category: CookieCategory) {
    if (selectedCookies.includes(category)) {
      setSelectedCookies(selectedCookies.filter((f) => f !== category));
    } else {
      setSelectedCookies([...selectedCookies, category]);
    }
  }
  function deny() {
    setCookies([CookieCategory.REQUIRED]);
  }
  function allowSelected() {
    setCookies(selectedCookies);
  }
  function allowAll() {
    setCookies(allCookieCategories);
  }

  return (
    <div className="space-y-3">
      <div className="font-extrabold">Cookies</div>

      <CookiesList selectedCookies={selectedCookies} toggle={toggle} />

      <div className="grid gap-2 sm:grid-cols-3">
        <Button variant="outline" onClick={deny}>
          {t("shared.deny")}
        </Button>
        <Button variant="outline" onClick={allowSelected}>
          {t("shared.allowSelected")}
        </Button>
        <Button variant="outline" type="button" onClick={allowAll}>
          {t("shared.allowAll")}
        </Button>
      </div>
    </div>
  );
}
