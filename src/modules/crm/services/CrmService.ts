import { DefaultEntityTypes } from "@/lib/dtos/shared/DefaultEntityTypes";
import { Colors } from "@/lib/enums/shared/Colors";
import NotificationService from "@/modules/notifications/services/server/NotificationService";
import { createRelationship } from "@/utils/api/server/RowRelationshipsApi";
import { create, find, addTag } from "@/utils/api/server/RowsApi";
import { cachified, clearCacheKey } from "@/lib/services/cache.server";
import { db } from "@/db";
import { prisma } from "@/db/config/prisma/database";
import RowValueService, { RowValueUpdateDto } from "@/lib/helpers/server/RowValueService";
import RowHelper from "@/lib/helpers/RowHelper";
import RowValueHelper from "@/lib/helpers/RowValueHelper";
import { EntityWithDetailsDto } from "@/db/models/entityBuilder/EntitiesModel";
import { RowWithDetailsDto } from "@/db/models/entityBuilder/RowsModel";

async function checkCrmEntitiesExist(): Promise<boolean> {
  try {
    const crmEntities = ["company", "opportunity", "contact", "submission"];
    const entities = await db.entities.getEntitiesByName(crmEntities);
    return entities.length === crmEntities.length;
  } catch (error) {
    return false;
  }
}

async function validate(tenantId: string | null = null) {
  const crmEntities = ["company", "opportunity", "contact"];
  if (tenantId === null) {
    crmEntities.push("submission");
  }
  const entities = await db.entities.getEntitiesByName(crmEntities);
  await Promise.all(
    crmEntities.map(async (crmEntity) => {
      const entity = entities.find((i) => i.name === crmEntity);
      if (!entity) {
        throw new Error(`CRM is not configured: Entity "${crmEntity}" is required. Go to /admin/entities/templates/manual and load the template.`);
      }
      if (tenantId === null && ![DefaultEntityTypes.All, DefaultEntityTypes.AdminOnly].find((f) => f.toString() === entity.type)) {
        throw new Error(`CRM is not configured: Entity "${crmEntity}" must be "All" or "Admin"`);
      } else if (tenantId !== null && ![DefaultEntityTypes.All, DefaultEntityTypes.AppOnly].find((f) => f.toString() === entity.type)) {
        throw new Error(`CRM is not configured: Entity "${crmEntity}" must be "All" or "App"`);
      }
    })
  );
}

async function getContactsInRowIds(rowIds: string[]): Promise<ContactDto[]> {
  const contactsEntity = await db.entities.getEntityByName({ tenantId: null, name: "contact" });
  if (!contactsEntity) {
    throw new Error("Contact entity not found");
  }
  const rows = await db.rows.getRowsInIds(rowIds);
  return await Promise.all(
    rowIds
      .filter((f) => f)
      .map(async (rowId) => {
        const row = rows.find((i) => i.id === rowId);
        if (!row) {
          throw new Error("Contact not found: " + rowId);
        }
        const email = RowValueHelper.getText({ entity: contactsEntity, row, name: "email" }) ?? "";
        const firstName = RowValueHelper.getText({ entity: contactsEntity, row, name: "firstName" }) ?? "";
        const lastName = RowValueHelper.getText({ entity: contactsEntity, row, name: "lastName" }) ?? "";
        const jobTitle = RowValueHelper.getText({ entity: contactsEntity, row, name: "jobTitle" }) ?? "";
        const marketingSubscriber = RowValueHelper.getBoolean({ entity: contactsEntity, row, name: "marketingSubscriber" }) ?? false;
        const contact: ContactDto = {
          id: row.id,
          email,
          firstName,
          lastName,
          jobTitle,
          marketingSubscriber,
        };
        return contact;
      })
  );
}

export type ContactDto = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  marketingSubscriber: boolean;
  company?: {
    name: string;
  };
};
async function getContact(rowId: string): Promise<ContactDto | null> {
  const row = await db.rows.getRowById(rowId);
  if (!row) {
    return null;
  }
  const contactsEntity = await db.entities.getEntityByName({ tenantId: null, name: "contact" });
  if (!contactsEntity) {
    return null;
  }
  return await rowToContact({ row, entity: contactsEntity });
}

async function getContacts(tenantId: string | null): Promise<ContactDto[]> {
  const contactsEntity = await db.entities.getEntityByName({ tenantId, name: "contact" });
  if (!contactsEntity) {
    return [];
  }
  const rows = await db.rows.getRows({ entityName: "contact", tenantId });
  return await Promise.all(rows.map(async (row) => await rowToContact({ row, entity: contactsEntity })));
}

export type ContactFormSettings = { crm: boolean; actionUrl?: string; error?: string };
async function getContactFormSettings() {
  const settings: ContactFormSettings = {
    crm: false,
    actionUrl: undefined,
    error: undefined,
  };
  try {
    await validate();
    settings.crm = true;
  } catch (e: any) {
    if (process.env.INTEGRATIONS_CONTACT_FORMSPREE) {
      settings.actionUrl = process.env.INTEGRATIONS_CONTACT_FORMSPREE;
    } else {
      settings.error = "Contact form is not configured";
    }
  }
  return settings;
}

export type NewsletterFormSettings = {
  crm: boolean;
  convertKit?: boolean;
  error?: string;
};
async function getNewsletterFormSettings() {
  const settings: NewsletterFormSettings = {
    crm: false,
    convertKit: false,
    error: undefined,
  };
  if (process.env.CONVERTKIT_FORM && process.env.CONVERTKIT_APIKEY) {
    settings.convertKit = true;
  }
  try {
    await validate();
    settings.crm = true;
  } catch (e: any) {
    //
  }
  if (!settings.crm && !settings.convertKit) {
    settings.error = "Newsletter form is not configured";
  }
  return settings;
}

export type CrmSummaryDto = {
  companies: number;
  contacts: number;
  opportunities: { value: number; count: number };
  submissions: number;
  data: {
    openOpportunities: RowWithDetailsDto[];
    submissions: RowWithDetailsDto[];
  };
};
async function getSummary(tenantId: string | null): Promise<CrmSummaryDto> {
  // Check if CRM entities exist before proceeding
  const crmEntitiesExist = await checkCrmEntitiesExist();
  if (!crmEntitiesExist) {
    throw new Error(
      "CRM entities not found. Please import the CRM entities template from /admin/entities/templates/manual by selecting 'Default: CRM' and creating the entities."
    );
  }

  const openOpportunities = await db.rows.getRows({
    tenantId,
    entityName: "opportunity",
  });
  const opportunities = { value: 0, count: 0 };
  const opportunitiesEntity = await db.entities.getEntityByName({ tenantId, name: "opportunity" });
  if (!opportunitiesEntity) {
    throw new Error("Opportunities entity not found");
  }
  openOpportunities.forEach((row) => {
    const value = RowValueHelper.getNumber({ entity: opportunitiesEntity, row, name: "value" });
    opportunities.value += value ?? 0;
    if ((value ?? 0) > 0) {
      opportunities.count++;
    }
  });
  const submissions = await db.rows.getRows({ entityName: "submission", tenantId });
  return {
    companies: await db.rows.countRows({ entityName: "company", tenantId }),
    contacts: await db.rows.countRows({ entityName: "contact", tenantId }),
    opportunities,
    submissions: submissions.length,
    data: {
      openOpportunities,
      submissions,
    },
  };
}

async function createCompany({ tenantId, name, request }: { tenantId: string | null; name: string; request: Request }) {
  const entity = await db.entities.getEntityByName({ tenantId, name: "company" });
  const rowValues = RowHelper.getRowPropertiesFromForm({
    entity,
    values: [{ name: "name", value: name }],
  });
  const row = await create({
    entity,
    tenantId,
    rowValues,
    request,
  });
  return row;
}

async function createContact({
  tenantId,
  firstName,
  lastName,
  email,
  jobTitle,
  status,
  marketingSubscriber,
  options,
  request,
}: {
  tenantId: string | null;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle?: string;
  status: string;
  marketingSubscriber: boolean;
  options?: {
    checkUsage: boolean;
    createLog: boolean;
    createEvent: boolean;
    storeMedia: boolean;
    reportUsage: boolean;
  };
  request: Request;
}) {
  const entity = await db.entities.getEntityByName({ tenantId, name: "contact" });
  const rowValues = RowHelper.getRowPropertiesFromForm({
    entity,
    values: [
      { name: "firstName", value: firstName },
      { name: "lastName", value: lastName },
      { name: "email", value: email },
      { name: "jobTitle", value: jobTitle ?? "" },
      { name: "status", value: status },
      { name: "marketingSubscriber", value: marketingSubscriber ? "true" : "false" },
    ],
    options: {
      skipValidation: true,
    },
  });
  return await create({
    entity,
    tenantId,
    rowValues,
    options,
    request,
  });
}

async function createSubmission({ tenantId, users, message, request }: { tenantId: string | null; users: string; message: string; request: Request }) {
  const entity = await db.entities.getEntityByName({ tenantId, name: "submission" });
  const rowValues = RowHelper.getRowPropertiesFromForm({
    entity,
    values: [
      { name: "users", value: users },
      { name: "message", value: message },
    ],
  });
  const row = await create({
    entity,
    tenantId,
    rowValues,
    request,
  });
  return row;
}

async function createContactSubmission(
  submission: {
    firstName: string;
    lastName: string;
    email: string;
    jobTitle?: string;
    company?: string;
    users: string;
    message: string;
  },
  request: Request
) {
  let contact = await find({
    entity: { name: "contact" },
    tenantId: null,
    properties: [{ name: "email", value: submission.email }],
  });

  if (!contact) {
    contact = await createContact({
      tenantId: null,
      firstName: submission.firstName,
      lastName: submission.lastName,
      email: submission.email,
      jobTitle: submission.jobTitle,
      status: "contact",
      marketingSubscriber: false,
      request,
    });
    await addTag({ row: contact, tag: { value: "form", color: Colors.BLUE } });
  }
  const companyEntity = await db.entities.getEntityByName({ tenantId: null, name: "company" });
  const companies = companyEntity != null ? contact.parentRows.filter((f) => f.parent.entityId === companyEntity.id).map((f) => f.parent) : [];
  if (companyEntity && companies.length === 0 && submission.company) {
    const company = await createCompany({
      tenantId: null,
      name: submission.company,
      request,
    });
    await createRelationship({
      parent: company,
      child: contact,
    });
  }

  const newSubmission = await createSubmission({
    tenantId: null,
    users: submission.users,
    message: submission.message,
    request,
  });
  await createRelationship({
    parent: contact,
    child: newSubmission,
  });

  return contact;
}

async function updateContact(
  rowId: string,
  data: {
    marketingSubscriber?: boolean;
    firstName?: string;
    lastName?: string;
    jobTitle?: string;
  },
  options?: {
    createEvent?: boolean;
  }
) {
  const contactsEntity = await db.entities.getEntityByName({ tenantId: null, name: "contact" });
  const row = await db.rows.getRowById(rowId);
  if (!row || !contactsEntity) {
    return null;
  }
  const contact = await rowToContact({ row, entity: contactsEntity });
  let changes: RowValueUpdateDto[] = [];
  if (data.firstName !== undefined && data.firstName !== contact.firstName) {
    changes.push({ name: "firstName", textValue: data.firstName });
  } else if (data.lastName !== undefined && data.lastName !== contact.lastName) {
    changes.push({ name: "lastName", textValue: data.lastName });
  } else if (data.jobTitle !== undefined && data.jobTitle !== contact.jobTitle) {
    changes.push({ name: "jobTitle", textValue: data.jobTitle });
  } else if (data.marketingSubscriber !== undefined && data.marketingSubscriber !== contact.marketingSubscriber) {
    changes.push({ name: "marketingSubscriber", booleanValue: data.marketingSubscriber });
  }
  if (changes.length === 0) {
    return [];
  }
  await RowValueService.update({
    entity: contactsEntity,
    row,
    values: changes,
    session: { tenantId: row.tenantId },
    checkPermissions: false,
    options: {
      createEvent: options?.createEvent,
    },
  });
  return changes;
}

async function subscribeToNewsletter({
  firstName,
  lastName,
  email,
  source,
  request,
}: {
  firstName: string;
  lastName: string;
  email: string;
  source?: string;
  request: Request;
}) {
  const settings = await getNewsletterFormSettings();
  if (!settings.crm && !settings.convertKit) {
    return { error: "No CRM or ConvertKit integration configured" };
  }

  if (settings.crm) {
    console.log("[Newsletter] Creating contact in CRM");
    let contact = await find({
      entity: { name: "contact" },
      tenantId: null,
      properties: [{ name: "email", value: email }],
    });

    if (!contact) {
      contact = await createContact({
        tenantId: null,
        firstName,
        lastName,
        email: email,
        jobTitle: "",
        status: "contact",
        marketingSubscriber: true,
        request,
      });
      if (source) {
        await addTag({ row: contact, tag: { value: source, color: Colors.ORANGE } });
      } else {
        await addTag({ row: contact, tag: { value: "newsletter", color: Colors.ORANGE } });
      }
    } else {
      await updateContact(contact.id, { marketingSubscriber: true });
    }
  }
  if (settings.convertKit) {
    console.log("[Newsletter] Subscribing to ConvertKit");
    const API_KEY = process.env.CONVERTKIT_APIKEY;
    const FORM_ID = process.env.CONVERTKIT_FORM;
    const API = "https://api.convertkit.com/v3";

    const res = await fetch(`${API}/forms/${FORM_ID}/subscribe`, {
      method: "post",
      body: JSON.stringify({ email, firstName, lastName, api_key: API_KEY }),
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });

    try {
      const response = await res.json();
      console.log("[Newsletter] ConvertKit response", response);
      if (response.error) {
        return { error: response.message };
      } else {
        await NotificationService.sendToRoles({
          channel: "admin-users",
          notification: {
            message: `Newsletter subscription (${source}): ${firstName} ${lastName} <${email}>`,
          },
        });
      }
    } catch (e: any) {
      console.error("[Newsletter] ConvertKit error", e);
      return { error: e.message };
    }
  }
  return { success: "Subscribed" };
}

async function rowToContact({ row, entity }: { row: RowWithDetailsDto; entity: EntityWithDetailsDto }) {
  const email = RowValueHelper.getText({ entity, row, name: "email" }) ?? "";
  const firstName = RowValueHelper.getText({ entity, row, name: "firstName" }) ?? "";
  const lastName = RowValueHelper.getText({ entity, row, name: "lastName" }) ?? "";
  const jobTitle = RowValueHelper.getText({ entity, row, name: "jobTitle" }) ?? "";
  const marketingSubscriber = RowValueHelper.getBoolean({ entity, row, name: "marketingSubscriber" }) ?? false;

  // Get company entity to match against parent rows
  const companyEntity = await db.entities.getEntityByName({ tenantId: row.tenantId, name: "company" });
  const companyRow = companyEntity ? row.parentRows.find((f) => f.parent.entityId === companyEntity.id)?.parent : null;
  let company: { name: string } | undefined = undefined;
  if (companyRow && companyEntity) {
    company = {
      name: RowValueHelper.getText({ entity: companyEntity, row: companyRow, name: "name" }) ?? "",
    };
  }

  return {
    id: row.id,
    email,
    firstName,
    lastName,
    jobTitle,
    marketingSubscriber,
    company,
  };
}

export type UserInCrmDto = {
  status: "synced" | "to-create" | "to-update";
  email: string;
  source: "user" | "convertkit";
  id: string;
  firstName: string;
  lastName: string;
  isContact: boolean;
  contact: ContactDto | null;
  updatedAt: Date | null;
};
async function getUsersInCrm({ invalidateCache }: { invalidateCache?: boolean }): Promise<UserInCrmDto[]> {
  const contacts = await getContacts(null);

  let usersInCrm: UserInCrmDto[] = [];

  usersInCrm.push(...(await loadFromUsers({ contacts })));
  usersInCrm.push(...(await loadFromConvertKit({ contacts, usersInCrm, invalidateCache })));

  // load from convertkit

  // filter by not contacts first, then by updated date desc

  usersInCrm = usersInCrm.sort((a, b) => {
    if (a.isContact && !b.isContact) {
      return 1;
    } else if (!a.isContact && b.isContact) {
      return -1;
    } else if (a.updatedAt && b.updatedAt) {
      return b.updatedAt.getTime() - a.updatedAt.getTime();
    } else if (a.updatedAt) {
      return -1;
    } else if (b.updatedAt) {
      return 1;
    }
    return 0;
  });

  return usersInCrm;
}

async function loadFromUsers({ contacts }: { contacts: ContactDto[] }) {
  let usersInCrm: UserInCrmDto[] = [];
  const users = await prisma.user.findMany({});
  users.forEach((user) => {
    const contact = contacts.find((f) => f.email === user.email) ?? null;
    let status: "synced" | "to-create" | "to-update" = "synced";
    if (!contact) {
      status = "to-create";
    } else if (contact.firstName !== user.firstName || contact.lastName !== user.lastName) {
      status = "to-update";
    }
    const userInCrm: UserInCrmDto = {
      status,
      email: user.email,
      source: "user",
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      updatedAt: user.updatedAt,
      isContact: !!contact,
      contact,
    };
    usersInCrm.push(userInCrm);
  });
  return usersInCrm;
}

async function loadFromConvertKit({
  contacts,
  usersInCrm,
  invalidateCache,
}: {
  contacts: ContactDto[];
  usersInCrm: UserInCrmDto[];
  invalidateCache?: boolean;
}) {
  if (!process.env.CONVERTKIT_API_SECRET) {
    return [];
  }
  let convertKitUsersInCrm: UserInCrmDto[] = [];
  try {
    if (invalidateCache) {
      clearCacheKey("convertkit-users");
    }
    const convertKitUsers = await cachified({
      key: "convertkit-users",
      ttl: 60 * 60 * 1000,
      getFreshValue: () => {
        // eslint-disable-next-line no-console
        console.log("[CrmService] Fetching ConvertKit users");
        return fetchConvertKitUsers_AllPages();
      },
    });
    // eslint-disable-next-line no-console
    console.log("[CrmService] ConvertKit users", convertKitUsers.length);
    convertKitUsers.forEach((user) => {
      const contact = contacts.find((f) => f.email === user.email) ?? null;
      let status: "synced" | "to-create" | "to-update" = "synced";
      if (!contact) {
        status = "to-create";
      } else if (contact.firstName !== user.firstName || contact.lastName !== user.lastName) {
        status = "to-update";
      }
      const userInCrm: UserInCrmDto = {
        status,
        email: user.email,
        source: "convertkit",
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        updatedAt: user.updatedAt,
        isContact: !!contact,
        contact,
      };
      if (!usersInCrm.find((f) => f.email === user.email)) {
        convertKitUsersInCrm.push(userInCrm);
      }
    });
    return convertKitUsersInCrm;
  } catch (e: any) {
    // eslint-disable-next-line no-console
    console.error("[CrmService] Could not get ConvertKit subscribers", e);
    throw new Error("ConvertKit error: " + e.message);
  }
}

async function fetchConvertKitUsers_AllPages() {
  const API_KEY = process.env.CONVERTKIT_API_SECRET;
  const API = "https://api.convertkit.com/v3";
  let users: { id: string; email: string; firstName: string; lastName: string; updatedAt: Date }[] = [];
  let page = 1;
  let total = 0;
  let fetched = 0;
  do {
    let url = `${API}/subscribers?api_secret=${API_KEY}&page=${page}`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
    });
    const response = await res.json();
    if (!res.ok) {
      throw new Error(res.statusText);
    }
    total = response.total_subscribers;
    fetched += response.subscribers.length;
    response.subscribers.forEach((s: any) => {
      const user: { id: string; email: string; firstName: string; lastName: string; updatedAt: Date } = {
        id: s.id.toString(),
        email: s.email_address,
        firstName: s.first_name || "",
        lastName: s.last_name || "",
        updatedAt: new Date(s.created_at),
      };
      users.push(user);
    });
    page++;
  } while (fetched < total);
  return users;
}

export default {
  validate,
  getContactsInRowIds,
  getContact,
  getContacts,
  getContactFormSettings,
  getNewsletterFormSettings,
  getSummary,
  createCompany,
  createContact,
  createSubmission,
  createContactSubmission,
  updateContact,
  subscribeToNewsletter,
  getUsersInCrm,
};
