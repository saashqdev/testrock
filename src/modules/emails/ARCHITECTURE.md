# Next.js Implementation Architecture

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         Next.js App Router                       │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  Page Component (Server Component)                               │
│  app/(app)/emails/inbound/page.tsx                              │
│                                                                  │
│  • Receives request props                                       │
│  • Calls loaderEmails() to fetch data                          │
│  • Passes data to InboundEmailsPage                            │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  InboundEmailsPage (Server Component)                           │
│  src/modules/emails/pages/InboundEmailsPage.tsx                 │
│                                                                  │
│  • Receives data from loader                                    │
│  • Passes data + children to client component                   │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  InboundEmailsRoute (Client Component) "use client"             │
│  src/modules/emails/routes/InboundEmailsRoute.tsx               │
│                                                                  │
│  • Receives data via props                                      │
│  • Manages UI state (syncedItems, syncError)                   │
│  • Handles user interactions                                    │
│  • Calls server action on sync                                  │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 │ (user clicks sync)
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│  syncEmailsAction (Server Action) "use server"                  │
│  src/modules/emails/actions/sync-emails.action.ts               │
│                                                                  │
│  • Fetches emails from Postmark                                 │
│  • Creates new email records in DB                              │
│  • Calls revalidatePath() to refresh                            │
│  • Returns success/error + updated items                        │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
                    ┌────────────────────────┐
                    │   Database (Prisma)     │
                    │   • Create emails       │
                    │   • Query emails        │
                    └────────────────────────┘
```

## Component Communication

```
┌──────────────────┐
│  User Action     │
│  (Click Sync)    │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────┐
│  confirmedSync()         │
│  • startTransition()     │
│  • Call server action    │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  syncEmailsAction()          │
│  (runs on server)            │
│  • Fetch from Postmark       │
│  • Save to database          │
│  • revalidatePath()          │
│  • Return result             │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Update Local State          │
│  • setSyncedItems()          │
│  • setSyncError()            │
└────────┬─────────────────────┘
         │
         ▼
┌──────────────────────────────┐
│  Re-render with new data     │
│  • Show updated emails       │
│  • Display errors if any     │
└──────────────────────────────┘
```

## File Structure

```
src/modules/emails/
│
├── actions/
│   ├── inbound-emails.ts              (legacy - can be removed)
│   └── sync-emails.action.ts          ✨ NEW - Server Action
│
├── loaders/
│   └── inbound-emails.ts              (reused - no changes)
│
├── pages/
│   └── InboundEmailsPage.tsx          ✨ NEW - Server Component wrapper
│
├── routes/
│   └── InboundEmailsRoute.tsx         🔄 UPDATED - Client Component
│
├── examples/
│   ├── inbound-emails-page.example.tsx           ✨ NEW
│   └── tenant-inbound-emails-page.example.tsx    ✨ NEW
│
└── README-NEXTJS.md                   ✨ NEW - Documentation
```

## Key Concepts

### Server Components (RSC)
- Render on the server
- Can directly access databases
- Don't ship JavaScript to client
- Can't use hooks or event handlers

### Client Components
- Render on client (after initial SSR)
- Can use hooks (useState, useEffect, etc.)
- Can handle user interactions
- Marked with "use client" directive

### Server Actions
- Functions that run on the server
- Can be called from client components
- Marked with "use server" directive
- Automatically create API endpoints

### Data Flow
1. **Server**: Page fetches initial data
2. **Server → Client**: Data passed as props
3. **Client**: User interacts with UI
4. **Client → Server**: Server action called
5. **Server**: Action processes request
6. **Server → Client**: Result returned
7. **Client**: UI updates with result
