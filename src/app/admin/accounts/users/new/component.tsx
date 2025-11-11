"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import InputText from "@/components/ui/input/InputText";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";

interface ComponentProps {
  adminRoles: RoleWithPermissionsDto[];
}

export default function Component({ adminRoles }: ComponentProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !password || !firstName) {
      toast.error("Missing required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            password,
            roles: selectedRoles.map((id) => ({ id, tenantId: undefined })),
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "An error occurred");
          return;
        }

        toast.success(data.success || "User created successfully");
        router.push("/admin/accounts/users");
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="inline-block w-full overflow-hidden p-1 text-left align-bottom sm:align-middle">
        <div className="space-y-2">
          <InputText autoFocus type="email" name="email" title={t("models.user.email")} value={email} setValue={setEmail} required />

          <InputText type="password" name="password" title={t("account.shared.password")} value={password} setValue={setPassword} required />

          <InputText name="firstName" title={t("models.user.firstName")} value={firstName} setValue={setFirstName} required />

          <InputText name="lastName" title={t("models.user.lastName")} value={lastName} setValue={setLastName} />

          <div>
            <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">{t("models.role.plural")}</label>
            <div className="border-border bg-background divide-border divide-y rounded-md border px-2 py-1">
              {adminRoles?.map((role) => (
                <InputCheckboxWithDescription
                  key={role.name}
                  name={role.name}
                  title={role.name}
                  description={role.description}
                  value={selectedRoles.includes(role.id)}
                  onChange={(e) => {
                    if (e) {
                      setSelectedRoles((f) => [...f, role.id]);
                    } else {
                      setSelectedRoles((f) => f.filter((f) => f !== role.id));
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
        <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
          <ButtonSecondary type="button" className="w-full" onClick={() => router.push("/admin/accounts/users")}>
            <div className="w-full text-center">{t("shared.back")}</div>
          </ButtonSecondary>
          <LoadingButton type="submit" disabled={isPending} className="w-full">
            {t("shared.save")}
          </LoadingButton>
        </div>
      </form>
    </div>
  );
}
