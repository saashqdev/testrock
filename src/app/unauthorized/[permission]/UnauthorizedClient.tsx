"use client";

import { useTranslation } from "react-i18next";
import { usePathname, useRouter } from "next/navigation";
import ButtonTertiary from "@/components/ui/buttons/ButtonTertiary";
import RefreshIcon from "@/components/ui/icons/RefreshIcon";
import { UserWithoutPasswordDto } from "@/db/models/accounts/UsersModel";

interface UnauthorizedClientProps {
  user: UserWithoutPasswordDto | null;
}

export default function UnauthorizedClient({ user }: UnauthorizedClientProps) {
  const { t } = useTranslation();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center justify-between space-x-2">
      <div>
        {user?.admin ? (
          <ButtonTertiary to="/admin">
            <div> &larr;</div>
            <div>{t("shared.goBackToAdmin")}</div>
          </ButtonTertiary>
        ) : (
          <ButtonTertiary to="/app">
            <div> &larr;</div>
            <div>{t("shared.goBackToApp")}</div>
          </ButtonTertiary>
        )}
      </div>

      <div>
        <ButtonTertiary type="button" onClick={() => router.push(pathname)}>
          <div>Re-check permission</div>
          <RefreshIcon className="h-4 w-4" />
        </ButtonTertiary>
      </div>
    </div>
  );
}
