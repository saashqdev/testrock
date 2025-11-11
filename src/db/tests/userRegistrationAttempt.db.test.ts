/* eslint-disable no-console */

import { describe, it, expect } from "vitest";
import { mockDb } from "@/db/config/mock/data/mockDb";
import { iterateORMs } from "./__db.test.utils";
import { prisma } from "../config/prisma/database";

iterateORMs((db, orm) => {
  describe(`[${orm}] user registration attempt`, () => {
    console.log("userRegistrationAttempt.test.ts", orm.toString());

    // beforeEach(async () => {
    //   await prisma.userRegistrationAttempt.deleteMany();
    // });

    it(`getByEmail: should get a registration by email`, async () => {
      await prisma.userRegistrationAttempt.create({ data: mockDb.userRegistrationAttempt[0] });
      const registration = await db.userRegistrationAttempt.getByEmail(mockDb.userRegistrationAttempt[0].email);
      expect(registration).not.toBeNull();
      expect(registration?.email).toBe(mockDb.userRegistrationAttempt[0].email);
    });

    it(`getByToken: should get a registration by token`, async () => {
      await prisma.userRegistrationAttempt.create({ data: mockDb.userRegistrationAttempt[0] });
      const registration = await db.userRegistrationAttempt.getByToken(mockDb.userRegistrationAttempt[0].token);
      expect(registration).not.toBeNull();
      expect(registration?.token).toBe(mockDb.userRegistrationAttempt[0].token);
    });

    it(`create: should create a new registration`, async () => {
      const id = await db.userRegistrationAttempt.create(mockDb.userRegistrationAttempt[0]);
      const registration = await prisma.userRegistrationAttempt.findUnique({ where: { id } });
      expect(registration).not.toBeNull();
      expect(registration?.email).toBe(mockDb.userRegistrationAttempt[0].email);
    });

    it(`create: should throw an error if a registration with the same email already exists`, async () => {
      await prisma.userRegistrationAttempt.create({ data: mockDb.userRegistrationAttempt[0] });
      await expect(db.userRegistrationAttempt.create(mockDb.userRegistrationAttempt[0])).rejects.toThrow();
    });

    it(`update: should update a registration`, async () => {
      const { id } = await prisma.userRegistrationAttempt.create({ data: mockDb.userRegistrationAttempt[0] });
      await db.userRegistrationAttempt.update(id, {
        firstName: "Updated",
        lastName: "Name",
        company: "New Company",
        token: "new-token",
      });
      const updatedRegistration = await prisma.userRegistrationAttempt.findUnique({ where: { id } });
      expect(updatedRegistration?.firstName).toBe("Updated");
      expect(updatedRegistration?.lastName).toBe("Name");
      expect(updatedRegistration?.company).toBe("New Company");
      expect(updatedRegistration?.createdTenantId).toBe(null);
      expect(updatedRegistration?.token).toBe("new-token");
    });
  });
});
