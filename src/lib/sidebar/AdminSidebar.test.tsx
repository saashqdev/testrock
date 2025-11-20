import { describe, it, expect, vi } from "vitest";
import { AdminSidebar } from "./AdminSidebar";

describe("AdminSidebar", () => {
  it("returns an array of sidebar items", () => {
    const sidebar = AdminSidebar({ appConfiguration: null, myTenants: undefined });

    expect(Array.isArray(sidebar)).toBe(true);

    sidebar.forEach((item) => {
      expect(typeof item.title).toBe("string");
      expect(typeof item.path).toBe("string");

      if (item.items) {
        expect(Array.isArray(item.items)).toBe(true);

        item.items.forEach((subItem) => {
          expect(typeof subItem.title).toBe("string");
          expect(typeof subItem.path).toBe("string");
        });
      }
    });
  });
});
