/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] tenant user invitation`, () => {
    // eslint-disable-next-line no-console
    console.log("tenantUserInvitation.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.tenantUserInvitation.deleteMany();
    //   await prisma.tenant.deleteMany();
    //   await prisma.tenantUser.deleteMany();
    //   await prisma.user.deleteMany();
    // });

    it(`get: should get a tenant user invitation`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      const { id } = await prisma.tenantUserInvitation.create({ data: mockDb.tenantUserInvitation[0] });
      const invitation = await db.tenantUserInvitation.get(id);
      expect(invitation).not.toBeNull();
      expect(invitation?.email).toBe(mockDb.tenantUserInvitation[0].email);
      expect(invitation?.id).toBe(id);
    });

    it(`getPending: should get all pending tenant user invitations for a tenant`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      await prisma.tenantUserInvitation.create({ data: mockDb.tenantUserInvitation[0] });
      await prisma.tenantUserInvitation.create({
        data: {
          ...mockDb.tenantUserInvitation[0],
          id: "2",
          email: `${mockDb.tenantUserInvitation[0].email}+2`,
        },
      });
      const invitations = await db.tenantUserInvitation.getPending(mockDb.tenantUserInvitation[0].tenantId);
      expect(invitations).toHaveLength(2);
    });

    it(`create: should create a new tenant user invitation`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      const id = await db.tenantUserInvitation.create(mockDb.tenantUserInvitation[0]);
      const invitation = await db.tenantUserInvitation.get(id);
      expect(invitation).not.toBeNull();
      expect(invitation?.email).toBe(mockDb.tenantUserInvitation[0].email);
    });

    it(`update: should update a tenant user invitation`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      const { id } = await prisma.tenantUserInvitation.create({ data: mockDb.tenantUserInvitation[0] });
      await db.tenantUserInvitation.update(id, {
        pending: false,
      });
      const invitation = await db.tenantUserInvitation.get(id);
      expect(invitation).not.toBeNull();
      expect(invitation?.pending).toBe(false);
    });

    it(`del: should delete a tenant user invitation`, async () => {
      await prisma.tenant.create({ data: mockDb.tenant[0] });
      const { id } = await prisma.tenantUserInvitation.create({ data: mockDb.tenantUserInvitation[0] });
      await db.tenantUserInvitation.del(id);
      const invitation = await db.tenantUserInvitation.get(id);
      expect(invitation).toBeNull();
    });
  });
});
