"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import LoadingButton from "@/components/ui/buttons/LoadingButton";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import InputText from "@/components/ui/input/InputText";
import { UserWithDetailsDto } from "@/db/models/accounts/UsersModel";

interface UserEditFormProps {
  user: UserWithDetailsDto;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function UserEditForm({ user, onSuccess, onCancel }: UserEditFormProps) {
  const { t } = useTranslation();
  const [isPending, startTransition] = useTransition();

  const [email, setEmail] = useState<string>(user.email);
  const [firstName, setFirstName] = useState<string>(user.firstName || "");
  const [lastName, setLastName] = useState<string>(user.lastName || "");
  const [newPassword, setNewPassword] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!email || !firstName) {
      toast.error("Missing required fields.");
      return;
    }

    startTransition(async () => {
      try {
        const response = await fetch(`/api/admin/users/${user.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            firstName,
            lastName,
            password: newPassword || undefined,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          toast.error(data.error || "An error occurred");
          return;
        }

        toast.success(data.success || "User updated successfully");
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

      <InputText
        type="password"
        name="newPassword"
        title={t("settings.profile.changePassword")}
        value={newPassword}
        setValue={setNewPassword}
        hint="Leave blank to keep current password"
      />

      <div className="mt-5 flex justify-end space-x-2">
        {onCancel && (
          <ButtonSecondary type="button" onClick={onCancel}>
            {t("shared.cancel")}
          </ButtonSecondary>
        )}
        <LoadingButton type="submit" disabled={isPending}>
          {t("shared.save")}
        </LoadingButton>
      </div>
    </form>
  );
}
