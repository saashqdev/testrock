"use client";

import { useTranslation } from "react-i18next";
import { useEffect, useRef, useActionState } from "react";
import { useAppOrAdminData } from "@/lib/state/useAppOrAdminData";
import ConfirmModal, { RefConfirmModal } from "@/components/ui/modals/ConfirmModal";
import InputGroup from "@/components/ui/forms/InputGroup";
import ButtonSecondary from "@/components/ui/buttons/ButtonSecondary";
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";
import TableSimple from "@/components/ui/tables/TableSimple";
import EditPageLayout from "@/components/ui/layouts/EditPageLayout";
import { toast } from "sonner";
import { RolesPermissionsSeed } from "./seed.server";
import { seedRolesPermissionsAction } from "./actions";

interface Props {
  data: RolesPermissionsSeed.LoaderData;
}

export default function RolesPermissionsSeedView({ data }: Props) {
  const { t } = useTranslation();
  const appOrAdminData = useAppOrAdminData();
  const modalConfirmSeed = useRef<RefConfirmModal>(null);

  const [actionData, formAction, pending] = useActionState(
    async (_state: RolesPermissionsSeed.ActionData | null, formData: FormData) => {
      return await seedRolesPermissionsAction(formData);
    },
    null
  );

  useEffect(() => {
    if (actionData?.success) {
      toast.success(actionData.success);
    } else if (actionData?.error) {
      toast.error(actionData.error);
    }
  }, [actionData]);

  function onSeed() {
    modalConfirmSeed.current?.show(
      "Seed missing roles and permissions",
      t("shared.confirm"),
      t("shared.back"),
      "Do you want to seed roles and permissions?"
    );
  }

  function onConfirmSeed() {
    const form = new FormData();
    form.set("action", "seed");
    formAction(form);
  }

  return (
    <EditPageLayout>
      <InputGroup title={"Missing roles & permissions"}>
        <div className="space-y-2">
          <h3 className="text-foreground text-lg font-medium">Roles</h3>
          <TableSimple
            items={data.roles.missing.map((role) => ({ ...role, id: role.name }))}
            headers={[
              {
                name: "type",
                title: "Type",
                value: (i) => i.type,
              },
              {
                name: "name",
                title: "Name",
                value: (i) => i.name,
                className: "w-full",
              },
            ]}
          />

          <h3 className="text-foreground text-lg font-medium">Permissions</h3>
          <TableSimple
            items={data.permissions.missing.map((perm) => ({ ...perm, id: perm.name }))}
            headers={[
              {
                name: "type",
                title: "Type",
                value: (i) => i.type,
              },
              {
                name: "name",
                title: "Name",
                value: (i) => i.name,
              },
              {
                name: "description",
                title: "Description",
                value: (i) => i.description,
                className: "w-full",
              },
              {
                name: "inRoles",
                title: "In roles",
                value: (i) => i.inRoles.join(", "),
              },
            ]}
          />

          <div className="flex justify-end">
            <ButtonSecondary
              disabled={!getUserHasPermission(appOrAdminData, "admin.roles.create") || pending}
              destructive
              onClick={onSeed}
            >
              Seed default: {data.roles.missing.length}/{data.roles.all.length} roles and {data.permissions.missing.length}/{data.permissions.all.length}{" "}
              permissions
            </ButtonSecondary>
          </div>
        </div>
      </InputGroup>

      <ConfirmModal ref={modalConfirmSeed} onYes={onConfirmSeed} />
    </EditPageLayout>
  );
}
