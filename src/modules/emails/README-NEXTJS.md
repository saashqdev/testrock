# Inbound Emails Module - Next.js Implementation

This module has been migrated from React Router to Next.js App Router.

## Architecture

### 1. **Server Action** (`sync-emails.action.ts`)
- Handles the email synchronization logic
- Runs on the server with `"use server"` directive
- Uses `revalidatePath()` to refresh data after sync
- Returns typed results with success/error states

### 2. **Page Component** (`InboundEmailsPage.tsx`)
- Server Component that fetches data using the loader
- Passes data as props to the client component
- Can be used with or without tenant context

### 3. **Route Component** (`InboundEmailsRoute.tsx`)
- Client Component (uses `"use client"`)
- Receives data via props instead of hooks
- Uses `useTransition()` for optimistic UI updates
- Manages local state for sync results and errors

## Files Created

```
src/modules/emails/
├── actions/
│   └── sync-emails.action.ts          # Server Action for email sync
├── pages/
│   └── InboundEmailsPage.tsx          # Server Component wrapper
├── routes/
│   └── InboundEmailsRoute.tsx         # Client Component (updated)
└── examples/
    ├── inbound-emails-page.example.tsx
    └── tenant-inbound-emails-page.example.tsx
```

## Usage

### Basic Implementation (No Tenant)

Create a page at `app/(app)/emails/inbound/page.tsx`:

```tsx
import InboundEmailsPage from "@/modules/emails/pages/InboundEmailsPage";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function Page(props: IServerComponentsProps) {
  return <InboundEmailsPage {...props} tenantId={null} />;
}
```

### With Tenant Context

Create a page at `app/(app)/[tenant]/emails/inbound/page.tsx`:

```tsx
import InboundEmailsPage from "@/modules/emails/pages/InboundEmailsPage";
import { IServerComponentsProps } from "@/lib/dtos/ServerComponentsProps";

export default async function TenantInboundEmailsPage(props: IServerComponentsProps) {
  const params = await props.params;
  const tenantId = params?.tenant as string;
  
  return <InboundEmailsPage {...props} tenantId={tenantId} />;
}
```

## Key Changes from React Router

| React Router | Next.js | Purpose |
|--------------|---------|---------|
| `useLoaderData()` | Props from Server Component | Data fetching |
| `useActionData()` | Local state + Server Action | Action results |
| `useSubmit()` | `useTransition()` + Server Action | Form submission |
| `<Outlet />` | `{children}` | Nested routes |

## Features

✅ Server-side data fetching  
✅ Client-side interactivity  
✅ Optimistic UI updates with `useTransition()`  
✅ Automatic cache revalidation  
✅ Error handling  
✅ TypeScript type safety  
✅ Tenant support  

## How the Sync Works

1. User clicks confirm in the modal
2. `confirmedSync()` is called
3. `startTransition()` wraps the async operation
4. `syncEmailsAction()` server action is called
5. Server fetches emails from Postmark
6. Server creates new email records in database
7. `revalidatePath()` refreshes the page data
8. Updated items are returned to client
9. Local state is updated with new items or error
10. UI re-renders with fresh data

## Dependencies

- `next` - Next.js framework
- `react` - React library with hooks
- `react-i18next` - Internationalization
- Database models and repositories
- Email service integrations (Postmark)
