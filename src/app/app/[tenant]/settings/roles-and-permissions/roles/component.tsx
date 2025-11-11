"use client";

import { RoleWithPermissionsAndUsersDto } from "@/db/models/permissions/RolesModel";
import RolesClient from "./roles.client";

interface RolesComponentProps {
  items: RoleWithPermissionsAndUsersDto[];
}

export default function RolesComponent({ items }: RolesComponentProps) {
  return <RolesClient items={items} />;
}
