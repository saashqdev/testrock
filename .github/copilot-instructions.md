# Copilot Instructions for NextRock/NextRock

## Project Overview
**NextRock** (aka "NextRock") is a Next.js 15 SaaS boilerplate featuring multi-tenancy, dynamic entity builder, workflow engine, and subscription management. Built on App Router with React Server Components, Prisma ORM, PostgreSQL, and TypeScript.

## Critical Architecture Patterns

### 1. NextJS-Inspired Server Component Pattern
**This is NOT standard Next.js** - the codebase uses a custom NextJS-like pattern:

```typescript
// Pattern in src/modules/**/routes/*.server.ts
export namespace Rows_Edit {
  export type LoaderData = { /* typed data */ };
  
  export const loader = async (props: IServerComponentsProps): Promise<LoaderData> => {
    const params = await props.params;  // MUST await params/searchParams
    const searchParams = await props.searchParams;
    // ... fetch data
    return { /* data */ };
  };
  
  export const action = async (props: IServerComponentsProps) => {
    const params = await props.params;
    const form = await props.request?.formData();
    // ... handle mutations
  };
}

// In page.tsx
import { Rows_Edit } from "@/modules/rows/routes/Rows_Edit.server";

export default async function Page(props: IServerComponentsProps) {
  const data = await Rows_Edit.loader(props);
  return <EditView data={data} />;
}
```

**Key Points**:
- `IServerComponentsProps` has `Promise<params>` and `Promise<searchParams>` - always `await` them
- Namespace exports group loader/action/types per route
- Import `*.server.ts` files ONLY in server components/routes

### 2. Multi-Tenant Architecture
**URL Structure**: `/app/:tenant/...` - tenant slug required in all app URLs

**Middleware** (`src/middleware.ts`):
- Extracts tenant from URL path
- Sets `x-tenant-slug` header for downstream use

**Layout Loaders** (`src/app/app/[tenant]/layout.tsx`):
- Call `requireTenantSlug()` and `getTenantIdFromUrl()` for validation
- Load permissions, subscriptions, entities, groups via `promiseHash()`
- Wrap children in `AppDataLayout` with typed `AppDataDto` context
- Redirect to `/login` if no session, `/app` if no tenant access

**Context Access**:
```typescript
// Client components
const { currentTenant, permissions, entities } = useAppData();

// Generate tenant URLs
import UrlUtils from "@/lib/utils/UrlUtils";
UrlUtils.currentTenantUrl(params, "dashboard");  // -> /app/:tenant/dashboard
```

### 3. Entity Builder System (Dynamic Schema)
**Concept**: Tenants define custom "entities" (like tables) at runtime without code changes.

**Database Schema**:
- `Entity` table: Defines entity metadata (name, slug, prefix, properties)
- `Property` table: Column definitions (name, type, isRequired, attributes)
- `Row` table: Stores records (links to entity)
- `RowValue` table: Stores dynamic property values (textValue, numberValue, dateValue, etc.)

**Access Patterns**:
```typescript
// Fetch entity definition
const entity = await EntitiesApi.getEntity({ tenantId, entityName: "contacts" });

// Get row data
const rowData = await RowsApi.get(rowId, { entity, tenantId, userId });

// Access property values
import RowHelper from "@/lib/helpers/RowHelper";
const email = RowHelper.getPropertyValue({ entity, item: row, propertyName: "email" });
const name = RowHelper.getTextDescription({ entity, item: row, t });

// Create/update rows
await RowsApi.create({
  entity,
  tenantId,
  userId,
  rowValues: {
    dynamicProperties: [
      { propertyId: "...", textValue: "value" },
      { propertyId: "...", numberValue: 123 }
    ]
  }
});
```

**Auto-Generated Routes**: `/app/[tenant]/[entity]/(auto-generated)/` provides CRUD UI for all entities.

### 4. Repository Pattern (Database Abstraction)
**Structure**:
- `src/db/interfaces/` - Interface definitions (e.g., `IRowsDb`, `IEntitiesDb`)
- `src/db/repositories/prisma/` - Prisma implementations
- `src/db/index.ts` - Singleton `db` object with all repositories

**Usage**:
```typescript
import { db } from "@/db";

// Use abstraction
const user = await db.users.getUserById(userId);
const tenant = await db.tenants.getTenant(tenantId);

// Direct Prisma if needed
import { prisma } from "@/db/config/prisma/database";
const rawQuery = await prisma.$queryRaw`...`;
```

### 5. Permissions System
**Format**: `entity.{entityName}.{action}` or feature-based (`admin.dashboard.view`)

**Server-Side Checks**:
```typescript
import { verifyUserHasPermission } from "@/lib/helpers/server/PermissionsService";
import { getEntityPermission } from "@/lib/helpers/PermissionsHelper";

// Throws redirect if fails
await verifyUserHasPermission(getEntityPermission(entity, "update"), tenantId);

// Row-level permissions
const { canUpdate, canDelete } = await getUserRowPermission(row, tenantId, userId);
```

**Client-Side**:
```typescript
import { getUserHasPermission } from "@/lib/helpers/PermissionsHelper";

const appData = useAppData();
if (getUserHasPermission(appData, "entity.contacts.create")) {
  // Show create button
}
```

## Development Workflows

### Running Locally
```powershell
pnpm dev              # Dev server (uses Turbopack)
pnpm build            # Production build
pnpm typecheck        # TypeScript validation
pnpm seed             # Seed database
```

### Database Changes
```powershell
# Edit prisma/schema.prisma, then:
npx prisma migrate dev --name your_description
npx prisma generate   # Regenerate client (auto-runs on pnpm install)
npx prisma studio     # Visual database browser
```

### Working with Entities
1. **Create Entity**: Admin UI at `/admin/entities` or seed in `prisma/seed.ts`
2. **Query Data**: 
   - `EntitiesApi.getEntity()` - fetch definition
   - `RowsApi.getAll()` - list rows with pagination/filters
   - `RowsApi.get()` - single row with relationships
3. **Modify Data**:
   - `RowsApi.create()` - new row
   - `RowsApi.update()` - update existing
   - `RowsApi.del()` - soft/hard delete
4. **Custom Logic**: Add hooks in `src/hooks/RowHooks.ts` (onBeforeCreate, onAfterUpdate, etc.)

## Project-Specific Conventions

### Path Aliases
`@/` → `src/` (defined in `tsconfig.json`). Always use absolute imports.

### Component Structure
- **shadcn/ui**: `src/components/ui/` (Button, Input, Dialog, etc.)
- **Client Components**: Add `"use client"` directive at top
- **Server Components**: Default - fetch data directly in component

### Styling
- **Tailwind CSS**: Utility-first (see `tailwind.config.ts`)
- **Theme Variables**: CSS vars in `src/styles/themes.css` (e.g., `theme-blue`)
- **Class Merging**: Use `cn()` from `@/lib/utils`

### i18n
```typescript
// Server components
import { getServerTranslations } from "@/i18n/server";
const { t } = await getServerTranslations();

// Client components
import { useTranslation } from "react-i18next";
const { t } = useTranslation();
```
Keys in `src/i18n/locales/{en,es}/`

### Sessions & Auth
- **JWT-based**: Cookie `RSN_session` (requires `SESSION_SECRET` env var)
- **Get Current User**: `await getUserInfo()` returns `{ userId, email, theme, locale }`
- **Protected Routes**: Layout loaders check session, redirect to `/login` if missing

### Caching
Configured via `CACHE_TYPE` env var or auto-detected:
- `redis` if `REDIS_URL` present
- `memory` for in-process cache
- `null` to disable

Uses `@epic-web/cachified` library.

## Environment Variables
See `src/modules/core/data/defaultAppConfiguration.ts` for defaults.

**Required**:
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - JWT signing key

**Optional**:
- `REDIS_URL` - Enable Redis caching
- `CACHE_TYPE` - Override cache strategy
- Email providers (Postmark/SendGrid)
- OAuth (GitHub/Google client IDs)
- Stripe keys

## Common Pitfalls

1. **Async Params in Next.js 15**: Always `await props.params` and `await props.searchParams`
2. **Server/Client Imports**: Never import `*.server.ts` in `"use client"` components
3. **Prisma Schema Changes**: Run `npx prisma generate` after pulling schema updates
4. **Tenant Context**: Use `UrlUtils.currentTenantUrl(params, path)` for links, not hardcoded URLs
5. **Permission Checks**: Verify both entity-level AND row-level permissions before mutations
6. **Entity Property Access**: Use `RowHelper.getPropertyValue()` not direct property access

## Troubleshooting Guide

### Permission & Authorization Errors

**"Unauthorized" / 401 Errors**
- **Cause**: Missing or invalid session cookie (`RSN_session`)
- **Fix**: Check `SESSION_SECRET` is set, verify `await getUserInfo()` returns valid userId
- **Debug**: Check browser cookies, verify JWT token is present

**Permission Redirect Loops**
- **Cause**: `verifyUserHasPermission()` throws redirect to `/unauthorized/...`
- **Fix**: Ensure user has required permission via role assignment
- **Check**: `db.userRoles.countUserPermission(userId, tenantId, permissionName) > 0`

**"You don't have access to this row"**
- **Cause**: Row-level permissions restrict access even with entity permission
- **Fix**: Check `RowPermission` table entries for the row
- **Debug**: Use `getUserRowPermission(row, tenantId, userId)` to inspect permissions

### Next.js 15 Async Props Issues

**"props.params is a Promise" TypeScript Error**
```typescript
// ❌ Wrong
const { tenant } = props.params;

// ✅ Correct
const params = await props.params;
const { tenant } = params;
```

**Missing URL Parameters**
- **Cause**: Not awaiting params before accessing properties
- **Fix**: Always destructure AFTER awaiting:
```typescript
// ❌ Wrong
const { tenant } = props.params;

// ✅ Correct
const params = await props.params;
const { tenant } = params;
```

### Tenant & Multi-Tenancy Issues

**"Tenant ID not found" Error**
- **Cause**: `requireTenantSlug()` called outside `/app/[tenant]/...` route
- **Fix**: Only call in tenant-scoped routes, use optional tenant for global routes

**Wrong Tenant Context in URLs**
- **Symptom**: Links navigate to `/app/undefined/...`
- **Fix**: Pass params object to `UrlUtils.currentTenantUrl(params, "path")`
- **Example**: `UrlUtils.currentTenantUrl(params, "dashboard")` not `"/app/${tenant}/dashboard"`

### Database & Prisma Issues

**"Prisma Client Not Found"**
- **Cause**: Prisma client not generated after schema changes
- **Fix**: Run `npx prisma generate` or `pnpm install` (triggers postinstall)

**Relation Load Errors**
- **Symptom**: "Property 'relationName' does not exist on type..."
- **Fix**: Relations are auto-included in repository methods via `RowModelHelper`
- **How it works**: `db.rows.getRowById(id)` uses `RowModelHelper.includeRowDetailsNested`:
```typescript
// ✅ Correct - relations already included
const row = await db.rows.getRowById(id);
// Access: row.values, row.parentRows, row.childRows, row.tenant, row.createdByUser, etc.

// ❌ Wrong - Don't query Prisma directly without includes
const row = await prisma.row.findUnique({ where: { id } }); // Missing relations!

// ✅ If custom query needed, use RowModelHelper
import RowModelHelper from "@/lib/helpers/models/RowModelHelper";
const row = await prisma.row.findUnique({
  where: { id },
  include: RowModelHelper.includeRowDetailsNested  // Auto-includes all relations
});
```
- **Included relations**: `values` (with `media`, `multiple`, `range`), `parentRows`, `childRows`, `tenant`, `createdByUser`, `createdByApiKey`, `tags`, `permissions`, `sampleCustomEntity`

**Type Mismatches with RowValue**
- **Symptom**: Can't access row.values[0].textValue directly
- **Fix**: Use `RowHelper.getPropertyValue({ entity, item: row, propertyName: "field" })`
- **Why**: Dynamic properties stored in RowValue table with type-specific columns

### Entity Builder Issues

**Entity Not Found**
- **Check**: Entity exists in `Entity` table for the tenant
- **Debug**: `await db.entities.getEntityByIdOrName({ tenantId, name: "entityName" })`

**Property Values Not Saving**
- **Cause**: Property ID mismatch or missing in `dynamicProperties` array
- **Fix**: Ensure `propertyId` matches `entity.properties[x].id`
- **Example**:
```typescript
rowValues: {
  dynamicProperties: [
    { propertyId: property.id, textValue: "value" }  // Must use property.id
  ]
}
```

**Formula Not Computing**
- **Check**: Formula property has `formula` object with valid expression
- **Debug**: Look in `FormulaLog` table for execution errors
- **Fix**: Verify formula syntax matches supported operations in `FormulaService`

### Caching Issues

**Stale Data After Updates**
- **Cause**: Redis/memory cache not invalidated
- **Fix**: Most APIs auto-invalidate, but check cache keys
- **Debug**: Set `CACHE_TYPE=null` to disable caching temporarily

**Redis Connection Failures**
- **Symptom**: "Redis connection failed after 3 retries"
- **Fix**: Verify `REDIS_URL` is correct or set `CACHE_TYPE=memory`
- **Fallback**: App automatically disables cache on connection failure

### Common Development Errors

**Module Not Found for Server Components**
- **Cause**: Importing client-only packages in `.server.ts` files
- **Fix**: Move client code to separate client component with `"use client"`

**Hydration Mismatch**
- **Cause**: `useAppData()` called during SSR returns default values
- **Fix**: Hook handles SSR gracefully, but ensure data passed via props for initial render

**Redirect Not Working**
- **Symptom**: `redirect()` called but page doesn't navigate
- **Fix**: Use `throw redirect(url)` not just `redirect(url)`
- **Why**: redirect() throws internally, must be thrown to work in try/catch blocks

### Type Errors

**Missing Type Definitions**
- **Symptom**: "Cannot find name 'IServerComponentsProps'"
- **Fix**: Import from `@/lib/dtos/ServerComponentsProps`

**Row Type Confusion**
- Use `RowWithDetailsDto` for full row with relations
- Use `RowWithValuesDto` for row with dynamic values
- Use `Row` (Prisma type) only in repository layer

### Debug Tips

**Enable Detailed Logging**
- Uncomment `console.log` statements in:
  - `RowHooks.ts` - track entity lifecycle
  - `FormulaService.ts` - debug formula execution
  - `PermissionsService.ts` - inspect permission checks

**Inspect Database State**
- `npx prisma studio` - visual DB browser
- Check `Log` table for audit trail
- Check `Event` table for webhook/event history

**Check Middleware Headers**
- `x-tenant-slug` - current tenant from URL
- `x-url` - full request URL
- `x-pathname` - request pathname

## Module Organization
```
src/modules/{feature}/
  ├── components/        # UI components
  ├── routes/           # *.server.ts loader/action namespaces
  ├── services/         # Business logic
  ├── repositories/     # Optional data layer
  ├── dtos/            # Type definitions
  └── utils/           # Helpers
```

Key modules: `accounts`, `rows`, `subscriptions`, `workflowEngine`, `onboarding`, `blog`, `knowledgeBase`

## Quick Reference
- **Config**: `src/modules/core/data/defaultAppConfiguration.ts`
- **Schema**: `prisma/schema.prisma`
- **DB Interface**: `src/db/index.ts` (singleton `db`)
- **Server APIs**: `src/utils/api/server/` (RowsApi, EntitiesApi, EntitiesViewsApi)
- **URL Utils**: `src/lib/utils/UrlUtils.ts`
- **Row Helpers**: `src/lib/helpers/RowHelper.tsx`

When implementing features, study similar modules first. Prioritize type safety and follow established patterns.