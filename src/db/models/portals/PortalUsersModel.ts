export type PortalUserModel = {
  id: string;
  portalId: string;
  userId: string;
  role: "admin" | "editor" | "viewer";
};
