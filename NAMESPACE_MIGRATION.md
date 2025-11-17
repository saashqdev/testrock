# Namespace to ES Module Migration Guide

This guide helps you convert TypeScript namespaces to ES modules across the codebase.

## Pattern to Convert

### Before (Namespace):
```typescript
export namespace Campaigns_List {
  export type LoaderData = { ... };
  export const loader = async (props: IServerComponentsProps) => { ... };
}
```

### After (ES Module):
```typescript
export type LoaderData = { ... };
export const loader = async (props: IServerComponentsProps) => { ... };
```

## Consumer Updates

### Before:
```typescript
import { Campaigns_List } from "./Campaigns_List";

function MyComponent({ data }: { data: Campaigns_List.LoaderData }) {
  const result = await Campaigns_List.loader(props);
  // ...
}
```

### After:
```typescript
import { LoaderData, loader } from "./Campaigns_List";

function MyComponent({ data }: { data: LoaderData }) {
  const result = await loader(props);
  // ...
}
```

## Files to Convert

Run this PowerShell command to find all files with namespaces:

```powershell
Get-ChildItem -Path src -Recurse -Include *.ts,*.tsx | Select-String "export namespace" | ForEach-Object { $_.Path } | Sort-Object -Unique
```

## Step-by-Step Process

### 1. For each namespace file:

1. Remove `export namespace NamespaceName {` line
2. Remove closing `}` at the end
3. Remove one level of indentation from all exports
4. Change `  export type` → `export type`
5. Change `  export const` → `export const`

### 2. For each consumer file:

1. Find imports: `import { NamespaceName } from "..."`
2. Identify what's being used (e.g., `NamespaceName.LoaderData`, `NamespaceName.loader`)
3. Update import: `import { LoaderData, loader } from "..."`
4. Replace all `NamespaceName.Export` with just `Export`

## Known Namespaces (from grep)

### Routes (modules/*/routes/*.ts):
- Campaigns_List, Campaigns_New
- Senders_List, Senders_New, Senders_Edit  
- OutboundEmails_List
- InboundEmails_List, InboundEmailEdit
- EmailMarketing_Summary
- Rows_List (already converted)

### APIs (utils/api/server/*.ts):
- PropertiesApi
- TenantsApi
- TenantTypesApi
- RowPermissionsApi
- RowCommentsApi
- RowRelationshipsApi
- EntityViewsApi
- EntitiesApi
- BlogApi

### Workflow Engine (modules/workflowEngine/routes/*.tsx):
- WorkflowEngineApi
- WorkflowsExecutionsApi
- WorkflowsVariablesApi
- WorkflowsIndexApi
- WorkflowsTemplatesApi
- WorkflowsIdExecutionsApi
- WorkflowsIdIndexApi
- WorkflowsIdRunApiApi
- WorkflowsIdRunManualApi
- WorkflowsIdRunStreamApi
- WorkflowsVariablesNewApi
- WorkflowEngineIndexApi
- WorkflowsVariablesIdApi
- WorkflowsDangerApi
- WorkflowsCredentialsApi
- WorkflowsCredentialsNewApi

### Page Blocks (modules/pageBlocks/**/*.ts):
- PageBlockService
- PageSettings_Index
- PricingPage
- PageMetaTags_Index
- NewsletterPage
- PageBlocks_Index
- LandingPage
- ContactPage
- PricingBlockService
- BlockVariableService
- TemplateBlockService
- CommunityBlockService
- RowsNewBlockService
- RowsOverviewBlockService
- RowsListBlockService
- BlogPostBlockService
- BlogPostsBlockService

### Knowledge Base (modules/knowledgeBase/routes/api/*.tsx):
- KbRoutesArticleApi
- KbRoutesIndexApi
- KbRoutesCategoryApi

### Onboarding (modules/onboarding/routes/api/**/*.ts):
- OnboardingSummaryApi
- OnboardingSessionOverviewApi
- OnboardingIndexApi
- OnboardingSessionsIndexApi

### Other:
- RowHooks (hooks/RowHooks.ts)
- FakeProjectService (modules/fake/fakeProjectsCrud/services/FakeCrudService.ts)

## Automated Script

Run the migration script:

```powershell
npx tsx scripts/migrate-namespaces-to-es-modules.ts
```

Then verify:

```powershell
pnpm typecheck
```

## Manual Verification

After migration, check for:
1. ✅ No more `export namespace` in codebase
2. ✅ All imports updated to named imports
3. ✅ No `Namespace.Member` usage patterns remain
4. ✅ TypeScript compiles without errors
5. ✅ All tests pass
