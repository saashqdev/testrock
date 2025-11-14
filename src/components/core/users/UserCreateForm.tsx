"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputText from "@/components/ui/input/InputText";
import InputCheckboxWithDescription from "@/components/ui/input/InputCheckboxWithDescription";
import { RoleWithPermissionsDto } from "@/db/models/permissions/RolesModel";

interface UserCreateFormProps {
  adminRoles: RoleWithPermissionsDto[];
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UserCreateForm({ adminRoles, onSuccess, onCancel }: UserCreateFormProps) {
  const { t } = useTranslation();
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
        onSuccess?.();
      } catch (error) {
        toast.error("An unexpected error occurred");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputText
        autoFocus
        type="email"
        name="email"
        title={t("models.user.email")}
        value={email}
        setValue={setEmail}
        required
      />

      <InputText
        type="password"
        name="password"
        title={t("account.shared.password")}
        value={password}
        setValue={setPassword}
        required
      />

      <InputText
        name="firstName"
        title={t("models.user.firstName")}
        value={firstName}
        setValue={setFirstName}
        required
      />

      <InputText
        name="lastName"
        title={t("models.user.lastName")}
        value={lastName}
        setValue={setLastName}
      />

      {adminRoles && adminRoles.length > 0 && (
        <div>
          <label className="mb-1 flex justify-between space-x-2 truncate text-xs font-medium">
            {t("models.role.plural")}
          </label>
          <div className="border-border bg-background divide-border divide-y rounded-md border px-2 py-1">
            {adminRoles.map((role) => (
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
      )}

      <div className="mt-5 flex justify-end space-x-2">
        {onCancel && (
          <ButtonSecondary type="button" onClick={onCancel}>
            {t("shared.cancel")}
          </ButtonSecondary>
        )}
        <LoadingButton type="submit" disabled={isPending}>
          {t("shared.create")}
        </LoadingButton>
      </div>
    </form>
  );
}
