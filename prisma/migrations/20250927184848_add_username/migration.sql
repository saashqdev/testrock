-- CreateTable
CREATE TABLE "public"."User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "defaultTenantId" TEXT,
    "verifyToken" TEXT,
    "githubId" TEXT,
    "googleId" TEXT,
    "locale" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AdminUser" (
    "userId" TEXT NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "public"."Tenant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "subscriptionId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "deactivatedReason" TEXT,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "joined" INTEGER NOT NULL,
    "status" INTEGER NOT NULL,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantUserInvitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "createdUserId" TEXT,
    "fromUserId" TEXT,

    CONSTRAINT "TenantUserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Registration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "company" TEXT,
    "selectedSubscriptionPriceId" TEXT,
    "createdTenantId" TEXT,

    CONSTRAINT "Registration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Blacklist" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "registerAttempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Blacklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantIpAddress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "ip" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TenantIpAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantType" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "titlePlural" TEXT NOT NULL,
    "description" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "TenantType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsSettings" (
    "id" TEXT NOT NULL,
    "public" BOOLEAN NOT NULL DEFAULT false,
    "ignorePages" TEXT NOT NULL,
    "onlyPages" TEXT NOT NULL,

    CONSTRAINT "AnalyticsSettings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsUniqueVisitor" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cookie" TEXT NOT NULL,
    "via" TEXT,
    "httpReferrer" TEXT,
    "browser" TEXT,
    "browserVersion" TEXT,
    "os" TEXT,
    "osVersion" TEXT,
    "device" TEXT,
    "source" TEXT,
    "medium" TEXT,
    "campaign" TEXT,
    "content" TEXT,
    "term" TEXT,
    "country" TEXT,
    "city" TEXT,
    "fromUrl" TEXT,
    "fromRoute" TEXT,
    "userId" TEXT,
    "portalId" TEXT,
    "portalUserId" TEXT,

    CONSTRAINT "AnalyticsUniqueVisitor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsPageView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueVisitorId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "route" TEXT,
    "portalId" TEXT,
    "portalUserId" TEXT,

    CONSTRAINT "AnalyticsPageView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AnalyticsEvent" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "uniqueVisitorId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "category" TEXT,
    "label" TEXT,
    "value" TEXT,
    "url" TEXT,
    "route" TEXT,
    "featureFlagId" TEXT,
    "portalId" TEXT,
    "portalUserId" TEXT,

    CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogCategory" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "BlogCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogTag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "BlogTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPostTag" (
    "id" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "BlogPostTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."BlogPost" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "tenantId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "image" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "readingTime" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL,
    "authorId" TEXT,
    "categoryId" TEXT,
    "contentType" TEXT NOT NULL DEFAULT 'markdown',

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."AppConfiguration" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "theme" TEXT,
    "authRequireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
    "authRequireOrganization" BOOLEAN NOT NULL DEFAULT true,
    "authRequireName" BOOLEAN NOT NULL DEFAULT true,
    "authRecaptchaSiteKey" TEXT,
    "analyticsEnabled" BOOLEAN NOT NULL DEFAULT true,
    "analyticsSimpleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsPlausibleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsGoogleAnalyticsTrackingId" TEXT,
    "subscriptionRequired" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionAllowSubscribeBeforeSignUp" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionAllowSignUpBeforeSubscribe" BOOLEAN NOT NULL DEFAULT true,
    "cookiesEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metricsEnabled" BOOLEAN NOT NULL DEFAULT false,
    "metricsLogToConsole" BOOLEAN NOT NULL DEFAULT false,
    "metricsSaveToDatabase" BOOLEAN NOT NULL DEFAULT false,
    "metricsIgnoreUrls" TEXT,
    "brandingLogo" TEXT,
    "brandingLogoDarkMode" TEXT,
    "brandingIcon" TEXT,
    "brandingIconDarkMode" TEXT,
    "brandingFavicon" TEXT,
    "headScripts" TEXT,
    "bodyScripts" TEXT,
    "emailProvider" TEXT,
    "emailFromEmail" TEXT,
    "emailFromName" TEXT,
    "emailSupportEmail" TEXT,

    CONSTRAINT "AppConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Log" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "userId" TEXT,
    "apiKeyId" TEXT,
    "rowId" TEXT,
    "url" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "commentId" TEXT,

    CONSTRAINT "Log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "alias" TEXT NOT NULL,
    "expires" TIMESTAMP(3),
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "ApiKey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKeyLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "apiKeyId" TEXT,
    "tenantId" TEXT,
    "ip" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "params" TEXT NOT NULL,
    "status" INTEGER,
    "duration" INTEGER,
    "error" TEXT,
    "type" TEXT,

    CONSTRAINT "ApiKeyLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Event" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "userId" TEXT,
    "name" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "resource" TEXT,
    "description" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EventWebhookAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "finishedAt" TIMESTAMP(3),
    "eventId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "success" BOOLEAN,
    "status" INTEGER,
    "message" TEXT,
    "body" TEXT,

    CONSTRAINT "EventWebhookAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."MetricLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "env" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "route" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "function" TEXT NOT NULL,
    "duration" INTEGER NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "MetricLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileUploadProgress" (
    "id" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "progressServer" INTEGER NOT NULL,
    "progressStorage" INTEGER NOT NULL,
    "url" TEXT,
    "error" TEXT,

    CONSTRAINT "FileUploadProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FileChunk" (
    "id" SERIAL NOT NULL,
    "fileUploadId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "data" BYTEA NOT NULL,

    CONSTRAINT "FileChunk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IpAddress" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "ip" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "countryName" TEXT NOT NULL,
    "regionCode" TEXT NOT NULL,
    "regionName" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zipCode" TEXT NOT NULL,
    "latitude" DECIMAL(65,30),
    "longitude" DECIMAL(65,30),
    "metadata" TEXT NOT NULL,

    CONSTRAINT "IpAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."IpAddressLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "error" TEXT,
    "metadata" TEXT,
    "ipAddressId" TEXT,

    CONSTRAINT "IpAddressLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Widget" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "appearance" TEXT NOT NULL,
    "metadata" TEXT NOT NULL,

    CONSTRAINT "Widget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Credential" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "value" JSONB NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantInboundAddress" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "TenantInboundAddress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Email" (
    "id" TEXT NOT NULL,
    "tenantInboundAddressId" TEXT,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "subject" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "toEmail" TEXT NOT NULL,
    "toName" TEXT,
    "textBody" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,

    CONSTRAINT "Email_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailRead" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "emailId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "EmailRead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailCc" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "toEmail" TEXT NOT NULL,
    "toName" TEXT,

    CONSTRAINT "EmailCc_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailAttachment" (
    "id" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "length" INTEGER NOT NULL,
    "content" TEXT NOT NULL,
    "publicUrl" TEXT,
    "storageBucket" TEXT,
    "storageProvider" TEXT,

    CONSTRAINT "EmailAttachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EmailSender" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "provider" TEXT NOT NULL,
    "stream" TEXT NOT NULL,
    "apiKey" TEXT NOT NULL,
    "fromEmail" TEXT NOT NULL,
    "fromName" TEXT,
    "replyToEmail" TEXT,

    CONSTRAINT "EmailSender_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Campaign" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT,
    "emailSenderId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "htmlBody" TEXT NOT NULL,
    "textBody" TEXT,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "track" BOOLEAN NOT NULL,
    "sentAt" TIMESTAMP(3),

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OutboundEmail" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "campaignId" TEXT,
    "contactRowId" TEXT,
    "email" TEXT NOT NULL,
    "fromSenderId" TEXT NOT NULL,
    "isPreview" BOOLEAN,
    "error" TEXT,
    "sentAt" TIMESTAMP(3),
    "deliveredAt" TIMESTAMP(3),
    "bouncedAt" TIMESTAMP(3),
    "spamComplainedAt" TIMESTAMP(3),
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "OutboundEmail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OutboundEmailOpen" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "firstOpen" BOOLEAN NOT NULL,
    "outboundEmailId" TEXT NOT NULL,

    CONSTRAINT "OutboundEmailOpen_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OutboundEmailClick" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "link" TEXT NOT NULL,
    "outboundEmailId" TEXT NOT NULL,

    CONSTRAINT "OutboundEmailClick_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Entity" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "moduleId" TEXT,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "prefix" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'app',
    "title" TEXT NOT NULL,
    "titlePlural" TEXT NOT NULL,
    "isAutogenerated" BOOLEAN NOT NULL,
    "hasApi" BOOLEAN NOT NULL,
    "icon" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "showInSidebar" BOOLEAN NOT NULL DEFAULT true,
    "hasTags" BOOLEAN NOT NULL DEFAULT true,
    "hasComments" BOOLEAN NOT NULL DEFAULT true,
    "hasTasks" BOOLEAN NOT NULL DEFAULT true,
    "hasActivity" BOOLEAN NOT NULL DEFAULT true,
    "hasBulkDelete" BOOLEAN NOT NULL DEFAULT false,
    "hasViews" BOOLEAN NOT NULL DEFAULT true,
    "defaultVisibility" TEXT NOT NULL DEFAULT 'private',
    "onCreated" TEXT DEFAULT 'redirectToOverview',
    "onEdit" TEXT DEFAULT 'editRoute',
    "promptFlowGroupId" TEXT,

    CONSTRAINT "Entity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Property" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "subtype" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isRequired" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "isDisplay" BOOLEAN NOT NULL DEFAULT false,
    "isUnique" BOOLEAN NOT NULL DEFAULT false,
    "isReadOnly" BOOLEAN NOT NULL DEFAULT false,
    "showInCreate" BOOLEAN NOT NULL DEFAULT true,
    "canUpdate" BOOLEAN NOT NULL DEFAULT true,
    "formulaId" TEXT,
    "tenantId" TEXT,

    CONSTRAINT "Property_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityView" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdByUserId" TEXT,
    "entityId" TEXT NOT NULL,
    "tenantId" TEXT,
    "userId" TEXT,
    "layout" TEXT NOT NULL DEFAULT 'table',
    "order" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pageSize" INTEGER NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "isSystem" BOOLEAN NOT NULL DEFAULT false,
    "gridColumns" INTEGER DEFAULT 5,
    "gridColumnsSm" INTEGER DEFAULT 2,
    "gridColumnsMd" INTEGER DEFAULT 3,
    "gridColumnsLg" INTEGER DEFAULT 4,
    "gridColumnsXl" INTEGER DEFAULT 5,
    "gridColumns2xl" INTEGER DEFAULT 6,
    "gridGap" TEXT DEFAULT 'sm',
    "groupByPropertyId" TEXT,

    CONSTRAINT "EntityView_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityViewProperty" (
    "id" TEXT NOT NULL,
    "entityViewId" TEXT NOT NULL,
    "propertyId" TEXT,
    "name" TEXT,
    "order" INTEGER NOT NULL,

    CONSTRAINT "EntityViewProperty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityViewFilter" (
    "id" TEXT NOT NULL,
    "entityViewId" TEXT NOT NULL,
    "match" TEXT NOT NULL DEFAULT 'and',
    "name" TEXT NOT NULL,
    "condition" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "EntityViewFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityViewSort" (
    "id" TEXT NOT NULL,
    "entityViewId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "asc" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "EntityViewSort_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyAttribute" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PropertyAttribute_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PropertyOption" (
    "id" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,
    "name" TEXT,
    "color" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "PropertyOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityTag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entityId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "EntityTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityTenantUserPermission" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "level" INTEGER NOT NULL,

    CONSTRAINT "EntityTenantUserPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityWebhook" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,

    CONSTRAINT "EntityWebhook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityWebhookLog" (
    "id" TEXT NOT NULL,
    "webhookId" TEXT NOT NULL,
    "logId" TEXT NOT NULL,
    "status" INTEGER NOT NULL,
    "error" TEXT,

    CONSTRAINT "EntityWebhookLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityRelationship" (
    "id" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "order" INTEGER,
    "title" TEXT,
    "type" TEXT NOT NULL DEFAULT 'one-to-many',
    "required" BOOLEAN NOT NULL DEFAULT false,
    "cascade" BOOLEAN NOT NULL DEFAULT false,
    "readOnly" BOOLEAN NOT NULL DEFAULT false,
    "hiddenIfEmpty" BOOLEAN NOT NULL DEFAULT false,
    "childEntityViewId" TEXT,
    "parentEntityViewId" TEXT,

    CONSTRAINT "EntityRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SampleCustomEntity" (
    "rowId" TEXT NOT NULL,
    "customText" TEXT NOT NULL,
    "customNumber" DECIMAL(65,30) NOT NULL,
    "customDate" TIMESTAMP(3) NOT NULL,
    "customBoolean" BOOLEAN NOT NULL,
    "customSelect" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."RowRelationship" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "relationshipId" TEXT NOT NULL,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "metadata" TEXT,

    CONSTRAINT "RowRelationship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Row" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "entityId" TEXT NOT NULL,
    "tenantId" TEXT,
    "folio" INTEGER NOT NULL,
    "createdByUserId" TEXT,
    "createdByApiKeyId" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Row_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowValue" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "rowId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,
    "textValue" TEXT,
    "numberValue" DECIMAL(65,30),
    "dateValue" TIMESTAMP(3),
    "booleanValue" BOOLEAN,

    CONSTRAINT "RowValue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowValueMultiple" (
    "id" TEXT NOT NULL,
    "rowValueId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "RowValueMultiple_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowValueRange" (
    "rowValueId" TEXT NOT NULL,
    "numberMin" DECIMAL(65,30),
    "numberMax" DECIMAL(65,30),
    "dateMin" TIMESTAMP(3),
    "dateMax" TIMESTAMP(3)
);

-- CreateTable
CREATE TABLE "public"."RowPermission" (
    "id" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "tenantId" TEXT,
    "roleId" TEXT,
    "groupId" TEXT,
    "userId" TEXT,
    "public" BOOLEAN,
    "access" TEXT NOT NULL DEFAULT 'view',

    CONSTRAINT "RowPermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowMedia" (
    "id" TEXT NOT NULL,
    "rowValueId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "publicUrl" TEXT,
    "storageBucket" TEXT,
    "storageProvider" TEXT,

    CONSTRAINT "RowMedia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowTag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rowId" TEXT NOT NULL,
    "tagId" TEXT NOT NULL,

    CONSTRAINT "RowTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowComment" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isDeleted" BOOLEAN,

    CONSTRAINT "RowComment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowCommentReaction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "rowCommentId" TEXT NOT NULL,
    "reaction" TEXT NOT NULL,

    CONSTRAINT "RowCommentReaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RowTask" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL,
    "completedAt" TIMESTAMP(3),
    "completedByUserId" TEXT,
    "assignedToUserId" TEXT,
    "deadline" TIMESTAMP(3),

    CONSTRAINT "RowTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "entityId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "config" TEXT NOT NULL,

    CONSTRAINT "EntityTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "collapsible" BOOLEAN NOT NULL,
    "section" TEXT,

    CONSTRAINT "EntityGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityGroupEntity" (
    "id" TEXT NOT NULL,
    "entityGroupId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "allViewId" TEXT,
    "selectMin" INTEGER,
    "selectMax" INTEGER,

    CONSTRAINT "EntityGroupEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Formula" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "resultAs" TEXT NOT NULL,
    "calculationTrigger" TEXT NOT NULL,
    "withLogs" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormulaComponent" (
    "id" TEXT NOT NULL,
    "formulaId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "FormulaComponent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormulaLog" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "formulaId" TEXT NOT NULL,
    "userId" TEXT,
    "tenantId" TEXT,
    "originalTrigger" TEXT,
    "triggeredBy" TEXT NOT NULL,
    "expression" TEXT NOT NULL,
    "result" TEXT NOT NULL,
    "duration" INTEGER NOT NULL DEFAULT 0,
    "error" TEXT,
    "rowValueId" TEXT,

    CONSTRAINT "FormulaLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FormulaComponentLog" (
    "id" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "rowId" TEXT,
    "formulaLogId" TEXT NOT NULL,

    CONSTRAINT "FormulaComponentLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityGroupConfiguration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "entityGroupId" TEXT NOT NULL,
    "title" TEXT NOT NULL,

    CONSTRAINT "EntityGroupConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."EntityGroupConfigurationRow" (
    "id" TEXT NOT NULL,
    "entityGroupConfigurationId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,

    CONSTRAINT "EntityGroupConfigurationRow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."ApiKeyEntity" (
    "id" TEXT NOT NULL,
    "apiKeyId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "create" BOOLEAN NOT NULL,
    "read" BOOLEAN NOT NULL,
    "update" BOOLEAN NOT NULL,
    "delete" BOOLEAN NOT NULL,

    CONSTRAINT "ApiKeyEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantSettingsRow" (
    "tenantId" TEXT NOT NULL,
    "rowId" TEXT NOT NULL,

    CONSTRAINT "TenantSettingsRow_pkey" PRIMARY KEY ("tenantId")
);

-- CreateTable
CREATE TABLE "public"."FeatureFlag" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."FeatureFlagFilter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "featureFlagId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "action" TEXT,

    CONSTRAINT "FeatureFlagFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Feedback" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT,
    "userId" TEXT,
    "message" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Survey" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "isEnabled" BOOLEAN NOT NULL,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,
    "minSubmissions" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SurveyItem" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "surveyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "shortName" TEXT,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "categories" JSONB NOT NULL,
    "href" TEXT,
    "color" TEXT,
    "options" JSONB NOT NULL,
    "style" TEXT,

    CONSTRAINT "SurveyItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SurveySubmission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "surveyId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,

    CONSTRAINT "SurveySubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SurveySubmissionResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "surveySubmissionId" TEXT NOT NULL,
    "surveyItemTitle" TEXT NOT NULL,
    "surveyItemType" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "other" TEXT,

    CONSTRAINT "SurveySubmissionResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBase" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "basePath" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "defaultLanguage" TEXT NOT NULL,
    "layout" TEXT NOT NULL,
    "color" INTEGER NOT NULL,
    "enabled" BOOLEAN NOT NULL,
    "languages" TEXT NOT NULL,
    "links" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "seoImage" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseCategory" (
    "id" TEXT NOT NULL,
    "knowledgeBaseId" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "seoImage" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseCategorySection" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseCategorySection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseArticle" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "knowledgeBaseId" TEXT NOT NULL,
    "categoryId" TEXT,
    "sectionId" TEXT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "contentDraft" TEXT NOT NULL,
    "contentPublished" TEXT NOT NULL DEFAULT '',
    "contentPublishedAsText" TEXT NOT NULL DEFAULT '',
    "contentType" TEXT NOT NULL,
    "language" TEXT NOT NULL,
    "featuredOrder" INTEGER,
    "seoImage" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "relatedInArticleId" TEXT,
    "createdByUserId" TEXT,

    CONSTRAINT "KnowledgeBaseArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseRelatedArticle" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "relatedArticleId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseRelatedArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseViews" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL,

    CONSTRAINT "KnowledgeBaseViews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseArticleViews" (
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseArticleUpvotes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."KnowledgeBaseArticleDownvotes" (
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "knowledgeBaseArticleId" TEXT NOT NULL,
    "userAnalyticsId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "public"."Onboarding" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "realtime" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "canBeDismissed" BOOLEAN NOT NULL DEFAULT true,
    "height" TEXT,

    CONSTRAINT "Onboarding_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingFilter" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,

    CONSTRAINT "OnboardingFilter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingStep" (
    "id" TEXT NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "block" TEXT NOT NULL,

    CONSTRAINT "OnboardingStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "onboardingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tenantId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "dismissedAt" TIMESTAMP(3),
    "createdRealtime" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "OnboardingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingSessionAction" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "onboardingSessionId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "OnboardingSessionAction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingSessionFilterMatch" (
    "id" TEXT NOT NULL,
    "onboardingFilterId" TEXT NOT NULL,
    "onboardingSessionId" TEXT NOT NULL,

    CONSTRAINT "OnboardingSessionFilterMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."OnboardingSessionStep" (
    "id" TEXT NOT NULL,
    "onboardingSessionId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "seenAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "OnboardingSessionStep_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Page" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "isPublic" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageMetaTag" (
    "id" TEXT NOT NULL,
    "pageId" TEXT,
    "order" INTEGER,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PageMetaTag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PageBlock" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "PageBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Role" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "assignToNewUsers" BOOLEAN NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Permission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,
    "entityId" TEXT,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRole" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Group" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdByUserId" TEXT NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" INTEGER NOT NULL,

    CONSTRAINT "Group_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."GroupUser" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "GroupUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Portal" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "createdByUserId" TEXT,
    "subdomain" TEXT NOT NULL,
    "domain" TEXT,
    "title" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL DEFAULT false,
    "stripeAccountId" TEXT,
    "themeColor" TEXT,
    "themeScheme" TEXT,
    "seoTitle" TEXT,
    "seoDescription" TEXT,
    "seoImage" TEXT,
    "seoThumbnail" TEXT,
    "seoTwitterCreator" TEXT,
    "seoTwitterSite" TEXT,
    "seoKeywords" TEXT,
    "authRequireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
    "authRequireOrganization" BOOLEAN NOT NULL DEFAULT true,
    "authRequireName" BOOLEAN NOT NULL DEFAULT true,
    "analyticsSimpleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsPlausibleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsGoogleAnalyticsTrackingId" TEXT,
    "brandingLogo" TEXT,
    "brandingLogoDarkMode" TEXT,
    "brandingIcon" TEXT,
    "brandingIconDarkMode" TEXT,
    "brandingFavicon" TEXT,
    "affiliatesRewardfulApiKey" TEXT,
    "affiliatesRewardfulUrl" TEXT,
    "metadata" JSONB,

    CONSTRAINT "Portal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "portalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "verifyToken" TEXT,
    "githubId" TEXT,
    "googleId" TEXT,
    "locale" TEXT,

    CONSTRAINT "PortalUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalPage" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "portalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "attributes" JSONB,

    CONSTRAINT "PortalPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalUserRegistration" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portalId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "company" TEXT,
    "selectedSubscriptionPriceId" TEXT,
    "createdPortalUserId" TEXT,

    CONSTRAINT "PortalUserRegistration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalSubscriptionProduct" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "model" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL,
    "groupTitle" TEXT,
    "groupDescription" TEXT,
    "description" TEXT,
    "badge" TEXT,
    "billingAddressCollection" TEXT NOT NULL DEFAULT 'auto',
    "hasQuantity" BOOLEAN NOT NULL DEFAULT false,
    "canBuyAgain" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PortalSubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalSubscriptionPrice" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "PortalSubscriptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalSubscriptionFeature" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "href" TEXT,
    "badge" TEXT,
    "accumulate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PortalSubscriptionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalUserSubscription" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "portalUserId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "PortalUserSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalUserSubscriptionProduct" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "portalUserSubscriptionId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "quantity" INTEGER,
    "fromCheckoutSessionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "PortalUserSubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalUserSubscriptionProductPrice" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "portalUserSubscriptionProductId" TEXT NOT NULL,
    "subscriptionPriceId" TEXT,

    CONSTRAINT "PortalUserSubscriptionProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PortalCheckoutSessionStatus" (
    "id" TEXT NOT NULL,
    "portalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "fromUserId" TEXT,
    "createdUserId" TEXT
);

-- CreateTable
CREATE TABLE "public"."PromptFlowGroup" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "PromptFlowGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptFlowGroupTemplate" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "promptFlowGroupId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowGroupTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptFlowGroupEntity" (
    "entityId" TEXT NOT NULL,
    "promptFlowGroupId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowGroupEntity_pkey" PRIMARY KEY ("entityId","promptFlowGroupId")
);

-- CreateTable
CREATE TABLE "public"."PromptFlow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "model" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "actionTitle" TEXT,
    "executionType" TEXT NOT NULL DEFAULT 'sequential',
    "promptFlowGroupId" TEXT,
    "stream" BOOLEAN NOT NULL DEFAULT false,
    "public" BOOLEAN NOT NULL DEFAULT true,
    "inputEntityId" TEXT,

    CONSTRAINT "PromptFlow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptFlowInputVariable" (
    "id" TEXT NOT NULL,
    "promptFlowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isRequired" BOOLEAN NOT NULL,

    CONSTRAINT "PromptFlowInputVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptTemplate" (
    "id" TEXT NOT NULL,
    "flowId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "template" TEXT NOT NULL,
    "temperature" DECIMAL(65,30) NOT NULL,
    "maxTokens" INTEGER,
    "generations" INTEGER,

    CONSTRAINT "PromptTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptFlowOutput" (
    "id" TEXT NOT NULL,
    "promptFlowId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowOutput_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptFlowOutputMapping" (
    "id" TEXT NOT NULL,
    "promptFlowOutputId" TEXT NOT NULL,
    "promptTemplateId" TEXT NOT NULL,
    "propertyId" TEXT NOT NULL,

    CONSTRAINT "PromptFlowOutputMapping_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptFlowExecution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flowId" TEXT NOT NULL,
    "model" TEXT,
    "userId" TEXT,
    "tenantId" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "duration" INTEGER,

    CONSTRAINT "PromptFlowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."PromptTemplateResult" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "flowExecutionId" TEXT NOT NULL,
    "templateId" TEXT,
    "order" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "response" TEXT,
    "error" TEXT,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "PromptTemplateResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionProduct" (
    "id" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL,
    "model" INTEGER NOT NULL,
    "public" BOOLEAN NOT NULL,
    "groupTitle" TEXT,
    "groupDescription" TEXT,
    "description" TEXT,
    "badge" TEXT,
    "billingAddressCollection" TEXT NOT NULL DEFAULT 'auto',
    "hasQuantity" BOOLEAN NOT NULL DEFAULT false,
    "canBuyAgain" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionPrice" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "SubscriptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionUsageBasedPrice" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "unit" TEXT NOT NULL,
    "unitTitle" TEXT NOT NULL,
    "unitTitlePlural" TEXT NOT NULL,
    "usageType" TEXT NOT NULL,
    "aggregateUsage" TEXT NOT NULL,
    "tiersMode" TEXT NOT NULL,
    "billingScheme" TEXT NOT NULL,

    CONSTRAINT "SubscriptionUsageBasedPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionUsageBasedTier" (
    "id" TEXT NOT NULL,
    "subscriptionUsageBasedPriceId" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER,
    "perUnitPrice" DOUBLE PRECISION,
    "flatFeePrice" DOUBLE PRECISION,

    CONSTRAINT "SubscriptionUsageBasedTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."SubscriptionFeature" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    "href" TEXT,
    "badge" TEXT,
    "accumulate" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SubscriptionFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantSubscriptionProduct" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantSubscriptionId" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "cancelledAt" TIMESTAMP(3),
    "endsAt" TIMESTAMP(3),
    "stripeSubscriptionId" TEXT,
    "quantity" INTEGER,
    "fromCheckoutSessionId" TEXT,
    "currentPeriodStart" TIMESTAMP(3),
    "currentPeriodEnd" TIMESTAMP(3),

    CONSTRAINT "TenantSubscriptionProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantSubscriptionProductPrice" (
    "id" TEXT NOT NULL,
    "tenantSubscriptionProductId" TEXT NOT NULL,
    "subscriptionPriceId" TEXT,
    "subscriptionUsageBasedPriceId" TEXT,

    CONSTRAINT "TenantSubscriptionProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."TenantSubscriptionUsageRecord" (
    "id" TEXT NOT NULL,
    "tenantSubscriptionProductPriceId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stripeSubscriptionItemId" TEXT,

    CONSTRAINT "TenantSubscriptionUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CheckoutSessionStatus" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "pending" BOOLEAN NOT NULL DEFAULT true,
    "email" TEXT NOT NULL,
    "fromUrl" TEXT NOT NULL,
    "fromUserId" TEXT,
    "fromTenantId" TEXT,
    "createdUserId" TEXT,
    "createdTenantId" TEXT
);

-- CreateTable
CREATE TABLE "public"."Credit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."Workflow" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "tenantId" TEXT,
    "createdByUserId" TEXT,
    "appliesToAllTenants" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Workflow_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowBlock" (
    "id" TEXT NOT NULL,
    "workflowId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isTrigger" BOOLEAN NOT NULL DEFAULT false,
    "isBlock" BOOLEAN NOT NULL DEFAULT false,
    "input" TEXT NOT NULL,

    CONSTRAINT "WorkflowBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowBlockConditionGroup" (
    "id" TEXT NOT NULL,
    "workflowBlockId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "WorkflowBlockConditionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowBlockCondition" (
    "id" TEXT NOT NULL,
    "workflowBlockConditionGroupId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "variable" TEXT NOT NULL,
    "operator" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "WorkflowBlockCondition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowBlockToBlock" (
    "id" TEXT NOT NULL,
    "fromBlockId" TEXT NOT NULL,
    "toBlockId" TEXT NOT NULL,
    "condition" TEXT,

    CONSTRAINT "WorkflowBlockToBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowExecution" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "workflowId" TEXT NOT NULL,
    "tenantId" TEXT,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "input" TEXT NOT NULL,
    "output" TEXT,
    "duration" INTEGER,
    "endedAt" TIMESTAMP(3),
    "error" TEXT,
    "waitingBlockId" TEXT,
    "createdByUserId" TEXT,
    "appliesToAllTenants" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "WorkflowExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowInputExample" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "workflowId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "input" TEXT,

    CONSTRAINT "WorkflowInputExample_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowBlockExecution" (
    "id" TEXT NOT NULL,
    "workflowExecutionId" TEXT NOT NULL,
    "workflowBlockId" TEXT NOT NULL,
    "fromWorkflowBlockId" TEXT,
    "status" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "input" TEXT,
    "output" TEXT,
    "duration" INTEGER,
    "endedAt" TIMESTAMP(3),
    "error" TEXT,

    CONSTRAINT "WorkflowBlockExecution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowVariable" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "userId" TEXT,

    CONSTRAINT "WorkflowVariable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."WorkflowCredential" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "tenantId" TEXT,
    "name" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "createdByUserId" TEXT,
    "userId" TEXT,

    CONSTRAINT "WorkflowCredential_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."UserRegistrationAttempt" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "slug" TEXT,
    "token" TEXT NOT NULL,
    "ipAddress" TEXT,
    "company" TEXT,
    "createdTenantId" TEXT,

    CONSTRAINT "UserRegistrationAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."_TenantToTenantType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_TenantToTenantType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "public"."_SubscriptionProductToTenantType" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SubscriptionProductToTenantType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "public"."User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "public"."User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_githubId_key" ON "public"."User"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "public"."User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_userId_key" ON "public"."AdminUser"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "public"."Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "public"."Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_tenantId_userId_key" ON "public"."TenantUser"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserInvitation_createdUserId_key" ON "public"."TenantUserInvitation"("createdUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_email_key" ON "public"."Registration"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_token_key" ON "public"."Registration"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Registration_createdTenantId_key" ON "public"."Registration"("createdTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantIpAddress_tenantId_ip_userId_apiKeyId_key" ON "public"."TenantIpAddress"("tenantId", "ip", "userId", "apiKeyId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantType_title_key" ON "public"."TenantType"("title");

-- CreateIndex
CREATE UNIQUE INDEX "AnalyticsUniqueVisitor_cookie_key" ON "public"."AnalyticsUniqueVisitor"("cookie");

-- CreateIndex
CREATE UNIQUE INDEX "BlogCategory_tenantId_name_key" ON "public"."BlogCategory"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogTag_name_key" ON "public"."BlogTag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_tenantId_slug_key" ON "public"."BlogPost"("tenantId", "slug");

-- CreateIndex
CREATE INDEX "ApiKey_key_idx" ON "public"."ApiKey"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_tenantId_alias_key" ON "public"."ApiKey"("tenantId", "alias");

-- CreateIndex
CREATE UNIQUE INDEX "ApiKey_tenantId_key_key" ON "public"."ApiKey"("tenantId", "key");

-- CreateIndex
CREATE INDEX "api_key_log_tenant" ON "public"."ApiKeyLog"("tenantId");

-- CreateIndex
CREATE INDEX "api_key_log_tenant_created_at" ON "public"."ApiKeyLog"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "api_key_log_tenant_type" ON "public"."ApiKeyLog"("tenantId", "type");

-- CreateIndex
CREATE UNIQUE INDEX "IpAddress_ip_key" ON "public"."IpAddress"("ip");

-- CreateIndex
CREATE UNIQUE INDEX "Widget_tenantId_name_key" ON "public"."Widget"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_name_key" ON "public"."Credential"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TenantInboundAddress_address_key" ON "public"."TenantInboundAddress"("address");

-- CreateIndex
CREATE UNIQUE INDEX "Email_messageId_key" ON "public"."Email"("messageId");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_name_key" ON "public"."Entity"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_slug_key" ON "public"."Entity"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Entity_prefix_key" ON "public"."Entity"("prefix");

-- CreateIndex
CREATE INDEX "entity_name" ON "public"."Entity"("name");

-- CreateIndex
CREATE INDEX "entity_slug" ON "public"."Entity"("slug");

-- CreateIndex
CREATE INDEX "entity_property" ON "public"."Property"("entityId");

-- CreateIndex
CREATE INDEX "entity_property_name" ON "public"."Property"("entityId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "Property_entityId_name_tenantId_key" ON "public"."Property"("entityId", "name", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Property_entityId_title_tenantId_key" ON "public"."Property"("entityId", "title", "tenantId");

-- CreateIndex
CREATE INDEX "entity_view" ON "public"."EntityView"("entityId");

-- CreateIndex
CREATE INDEX "entity_view_name" ON "public"."EntityView"("entityId", "name");

-- CreateIndex
CREATE INDEX "entity_view_property" ON "public"."EntityViewProperty"("entityViewId");

-- CreateIndex
CREATE INDEX "entity_view_property_name" ON "public"."EntityViewProperty"("entityViewId", "name");

-- CreateIndex
CREATE INDEX "entity_view_filter" ON "public"."EntityViewFilter"("entityViewId");

-- CreateIndex
CREATE INDEX "entity_view_filter_name" ON "public"."EntityViewFilter"("entityViewId", "name");

-- CreateIndex
CREATE INDEX "entity_view_sort" ON "public"."EntityViewSort"("entityViewId");

-- CreateIndex
CREATE INDEX "entity_view_sort_name" ON "public"."EntityViewSort"("entityViewId", "name");

-- CreateIndex
CREATE INDEX "property_attribute" ON "public"."PropertyAttribute"("propertyId");

-- CreateIndex
CREATE INDEX "property_attribute_name" ON "public"."PropertyAttribute"("propertyId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PropertyAttribute_propertyId_name_key" ON "public"."PropertyAttribute"("propertyId", "name");

-- CreateIndex
CREATE INDEX "property_option" ON "public"."PropertyOption"("propertyId");

-- CreateIndex
CREATE INDEX "property_option_name" ON "public"."PropertyOption"("propertyId", "name");

-- CreateIndex
CREATE INDEX "entity_tag" ON "public"."EntityTag"("entityId");

-- CreateIndex
CREATE INDEX "entity_tag_value" ON "public"."EntityTag"("entityId", "value");

-- CreateIndex
CREATE INDEX "parent_entity_relationship" ON "public"."EntityRelationship"("parentId");

-- CreateIndex
CREATE INDEX "child_entity_relationship" ON "public"."EntityRelationship"("childId");

-- CreateIndex
CREATE INDEX "parent_child_entity_relationship" ON "public"."EntityRelationship"("parentId", "childId");

-- CreateIndex
CREATE INDEX "parent_child_entity_relationship_order" ON "public"."EntityRelationship"("parentId", "childId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "EntityRelationship_parentId_childId_title_key" ON "public"."EntityRelationship"("parentId", "childId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "SampleCustomEntity_rowId_key" ON "public"."SampleCustomEntity"("rowId");

-- CreateIndex
CREATE INDEX "parent_row_relationship" ON "public"."RowRelationship"("parentId");

-- CreateIndex
CREATE INDEX "child_row_relationship" ON "public"."RowRelationship"("childId");

-- CreateIndex
CREATE INDEX "parent_child_row_relationship" ON "public"."RowRelationship"("parentId", "childId");

-- CreateIndex
CREATE UNIQUE INDEX "RowRelationship_parentId_childId_key" ON "public"."RowRelationship"("parentId", "childId");

-- CreateIndex
CREATE INDEX "row_deletedAt" ON "public"."Row"("deletedAt");

-- CreateIndex
CREATE INDEX "row_entity" ON "public"."Row"("entityId");

-- CreateIndex
CREATE INDEX "row_entity_tenant" ON "public"."Row"("entityId", "tenantId");

-- CreateIndex
CREATE INDEX "row_entity_tenant_created_at" ON "public"."Row"("entityId", "tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "row_tenant" ON "public"."Row"("tenantId");

-- CreateIndex
CREATE INDEX "row_createdByUserId" ON "public"."Row"("createdByUserId");

-- CreateIndex
CREATE INDEX "row_value_row" ON "public"."RowValue"("rowId");

-- CreateIndex
CREATE INDEX "row_value_row_property" ON "public"."RowValue"("rowId", "propertyId");

-- CreateIndex
CREATE INDEX "row_value_multiple_row_value" ON "public"."RowValueMultiple"("rowValueId");

-- CreateIndex
CREATE UNIQUE INDEX "RowValueRange_rowValueId_key" ON "public"."RowValueRange"("rowValueId");

-- CreateIndex
CREATE INDEX "row_value_range_row_value" ON "public"."RowValueRange"("rowValueId");

-- CreateIndex
CREATE INDEX "row_permission_row" ON "public"."RowPermission"("rowId");

-- CreateIndex
CREATE INDEX "row_permission_row_tenant" ON "public"."RowPermission"("rowId", "tenantId");

-- CreateIndex
CREATE INDEX "row_permission_row_role" ON "public"."RowPermission"("rowId", "roleId");

-- CreateIndex
CREATE INDEX "row_permission_row_group" ON "public"."RowPermission"("rowId", "groupId");

-- CreateIndex
CREATE INDEX "row_permission_row_user" ON "public"."RowPermission"("rowId", "userId");

-- CreateIndex
CREATE INDEX "row_permission_public" ON "public"."RowPermission"("public");

-- CreateIndex
CREATE INDEX "row_media_row_value" ON "public"."RowMedia"("rowValueId");

-- CreateIndex
CREATE INDEX "row_media_row_value_name" ON "public"."RowMedia"("rowValueId", "name");

-- CreateIndex
CREATE INDEX "row_tag_row" ON "public"."RowTag"("rowId");

-- CreateIndex
CREATE INDEX "row_tag_row_tag" ON "public"."RowTag"("rowId", "tagId");

-- CreateIndex
CREATE INDEX "row_comment_row" ON "public"."RowComment"("rowId");

-- CreateIndex
CREATE UNIQUE INDEX "EntityTemplate_tenantId_entityId_title_key" ON "public"."EntityTemplate"("tenantId", "entityId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "EntityGroup_slug_key" ON "public"."EntityGroup"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "EntityGroupConfigurationRow_entityGroupConfigurationId_rowI_key" ON "public"."EntityGroupConfigurationRow"("entityGroupConfigurationId", "rowId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSettingsRow_tenantId_key" ON "public"."TenantSettingsRow"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_name_description_key" ON "public"."FeatureFlag"("name", "description");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBase_slug_key" ON "public"."KnowledgeBase"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseCategory_knowledgeBaseId_slug_key" ON "public"."KnowledgeBaseCategory"("knowledgeBaseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticle_knowledgeBaseId_slug_key" ON "public"."KnowledgeBaseArticle"("knowledgeBaseId", "slug");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseViews_knowledgeBaseId_userAnalyticsId_key" ON "public"."KnowledgeBaseViews"("knowledgeBaseId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticleViews_knowledgeBaseArticleId_userAnalyt_key" ON "public"."KnowledgeBaseArticleViews"("knowledgeBaseArticleId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticleUpvotes_knowledgeBaseArticleId_userAnal_key" ON "public"."KnowledgeBaseArticleUpvotes"("knowledgeBaseArticleId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "KnowledgeBaseArticleDownvotes_knowledgeBaseArticleId_userAn_key" ON "public"."KnowledgeBaseArticleDownvotes"("knowledgeBaseArticleId", "userAnalyticsId");

-- CreateIndex
CREATE UNIQUE INDEX "OnboardingSession_onboardingId_userId_tenantId_key" ON "public"."OnboardingSession"("onboardingId", "userId", "tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Page_slug_key" ON "public"."Page"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "PageMetaTag_pageId_name_value_key" ON "public"."PageMetaTag"("pageId", "name", "value");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "public"."Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "public"."Permission"("name");

-- CreateIndex
CREATE INDEX "group_createdByUserId" ON "public"."Group"("createdByUserId");

-- CreateIndex
CREATE UNIQUE INDEX "Portal_subdomain_key" ON "public"."Portal"("subdomain");

-- CreateIndex
CREATE UNIQUE INDEX "Portal_domain_key" ON "public"."Portal"("domain");

-- CreateIndex
CREATE INDEX "PortalUser_portalId_idx" ON "public"."PortalUser"("portalId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_portalId_email_key" ON "public"."PortalUser"("portalId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_portalId_githubId_key" ON "public"."PortalUser"("portalId", "githubId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUser_portalId_googleId_key" ON "public"."PortalUser"("portalId", "googleId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalPage_portalId_name_key" ON "public"."PortalPage"("portalId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserRegistration_token_key" ON "public"."PortalUserRegistration"("token");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserRegistration_createdPortalUserId_key" ON "public"."PortalUserRegistration"("createdPortalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserRegistration_portalId_email_key" ON "public"."PortalUserRegistration"("portalId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "PortalUserSubscription_portalUserId_key" ON "public"."PortalUserSubscription"("portalUserId");

-- CreateIndex
CREATE UNIQUE INDEX "PortalCheckoutSessionStatus_id_key" ON "public"."PortalCheckoutSessionStatus"("id");

-- CreateIndex
CREATE UNIQUE INDEX "PromptFlowOutputMapping_promptFlowOutputId_promptTemplateId_key" ON "public"."PromptFlowOutputMapping"("promptFlowOutputId", "promptTemplateId", "propertyId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_tenantId_key" ON "public"."TenantSubscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSessionStatus_id_key" ON "public"."CheckoutSessionStatus"("id");

-- CreateIndex
CREATE INDEX "Credit_tenantId_userId_idx" ON "public"."Credit"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Credit_tenantId_createdAt_idx" ON "public"."Credit"("tenantId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowBlockToBlock_fromBlockId_toBlockId_key" ON "public"."WorkflowBlockToBlock"("fromBlockId", "toBlockId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowInputExample_workflowId_title_key" ON "public"."WorkflowInputExample"("workflowId", "title");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowVariable_tenantId_name_key" ON "public"."WorkflowVariable"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "WorkflowCredential_tenantId_name_key" ON "public"."WorkflowCredential"("tenantId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistrationAttempt_email_key" ON "public"."UserRegistrationAttempt"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistrationAttempt_token_key" ON "public"."UserRegistrationAttempt"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistrationAttempt_createdTenantId_key" ON "public"."UserRegistrationAttempt"("createdTenantId");

-- CreateIndex
CREATE INDEX "_TenantToTenantType_B_index" ON "public"."_TenantToTenantType"("B");

-- CreateIndex
CREATE INDEX "_SubscriptionProductToTenantType_B_index" ON "public"."_SubscriptionProductToTenantType"("B");

-- AddForeignKey
ALTER TABLE "public"."AdminUser" ADD CONSTRAINT "AdminUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Registration" ADD CONSTRAINT "Registration_createdTenantId_fkey" FOREIGN KEY ("createdTenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantIpAddress" ADD CONSTRAINT "TenantIpAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantIpAddress" ADD CONSTRAINT "TenantIpAddress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantIpAddress" ADD CONSTRAINT "TenantIpAddress_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsUniqueVisitor" ADD CONSTRAINT "AnalyticsUniqueVisitor_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "public"."PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_uniqueVisitorId_fkey" FOREIGN KEY ("uniqueVisitorId") REFERENCES "public"."AnalyticsUniqueVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsPageView" ADD CONSTRAINT "AnalyticsPageView_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "public"."PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_uniqueVisitorId_fkey" FOREIGN KEY ("uniqueVisitorId") REFERENCES "public"."AnalyticsUniqueVisitor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "public"."FeatureFlag"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."AnalyticsEvent" ADD CONSTRAINT "AnalyticsEvent_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "public"."PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogCategory" ADD CONSTRAINT "BlogCategory_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogTag" ADD CONSTRAINT "BlogTag_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostTag" ADD CONSTRAINT "BlogPostTag_postId_fkey" FOREIGN KEY ("postId") REFERENCES "public"."BlogPost"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPostTag" ADD CONSTRAINT "BlogPostTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."BlogTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."BlogPost" ADD CONSTRAINT "BlogPost_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."BlogCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "public"."RowComment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Log" ADD CONSTRAINT "Log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKey" ADD CONSTRAINT "ApiKey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKeyLog" ADD CONSTRAINT "ApiKeyLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Event" ADD CONSTRAINT "Event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EventWebhookAttempt" ADD CONSTRAINT "EventWebhookAttempt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "public"."Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MetricLog" ADD CONSTRAINT "MetricLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."MetricLog" ADD CONSTRAINT "MetricLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FileChunk" ADD CONSTRAINT "FileChunk_fileUploadId_fkey" FOREIGN KEY ("fileUploadId") REFERENCES "public"."FileUploadProgress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."IpAddressLog" ADD CONSTRAINT "IpAddressLog_ipAddressId_fkey" FOREIGN KEY ("ipAddressId") REFERENCES "public"."IpAddress"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Widget" ADD CONSTRAINT "Widget_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantInboundAddress" ADD CONSTRAINT "TenantInboundAddress_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Email" ADD CONSTRAINT "Email_tenantInboundAddressId_fkey" FOREIGN KEY ("tenantInboundAddressId") REFERENCES "public"."TenantInboundAddress"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailRead" ADD CONSTRAINT "EmailRead_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailRead" ADD CONSTRAINT "EmailRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailCc" ADD CONSTRAINT "EmailCc_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailAttachment" ADD CONSTRAINT "EmailAttachment_emailId_fkey" FOREIGN KEY ("emailId") REFERENCES "public"."Email"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EmailSender" ADD CONSTRAINT "EmailSender_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campaign" ADD CONSTRAINT "Campaign_emailSenderId_fkey" FOREIGN KEY ("emailSenderId") REFERENCES "public"."EmailSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Campaign" ADD CONSTRAINT "Campaign_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboundEmail" ADD CONSTRAINT "OutboundEmail_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboundEmail" ADD CONSTRAINT "OutboundEmail_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "public"."Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboundEmail" ADD CONSTRAINT "OutboundEmail_contactRowId_fkey" FOREIGN KEY ("contactRowId") REFERENCES "public"."Row"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboundEmail" ADD CONSTRAINT "OutboundEmail_fromSenderId_fkey" FOREIGN KEY ("fromSenderId") REFERENCES "public"."EmailSender"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboundEmailOpen" ADD CONSTRAINT "OutboundEmailOpen_outboundEmailId_fkey" FOREIGN KEY ("outboundEmailId") REFERENCES "public"."OutboundEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OutboundEmailClick" ADD CONSTRAINT "OutboundEmailClick_outboundEmailId_fkey" FOREIGN KEY ("outboundEmailId") REFERENCES "public"."OutboundEmail"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "public"."Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Property" ADD CONSTRAINT "Property_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityView" ADD CONSTRAINT "EntityView_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityView" ADD CONSTRAINT "EntityView_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityView" ADD CONSTRAINT "EntityView_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityView" ADD CONSTRAINT "EntityView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityView" ADD CONSTRAINT "EntityView_groupByPropertyId_fkey" FOREIGN KEY ("groupByPropertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityViewProperty" ADD CONSTRAINT "EntityViewProperty_entityViewId_fkey" FOREIGN KEY ("entityViewId") REFERENCES "public"."EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityViewProperty" ADD CONSTRAINT "EntityViewProperty_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityViewFilter" ADD CONSTRAINT "EntityViewFilter_entityViewId_fkey" FOREIGN KEY ("entityViewId") REFERENCES "public"."EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityViewSort" ADD CONSTRAINT "EntityViewSort_entityViewId_fkey" FOREIGN KEY ("entityViewId") REFERENCES "public"."EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyAttribute" ADD CONSTRAINT "PropertyAttribute_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PropertyOption" ADD CONSTRAINT "PropertyOption_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityTag" ADD CONSTRAINT "EntityTag_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityTenantUserPermission" ADD CONSTRAINT "EntityTenantUserPermission_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityWebhook" ADD CONSTRAINT "EntityWebhook_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityWebhookLog" ADD CONSTRAINT "EntityWebhookLog_logId_fkey" FOREIGN KEY ("logId") REFERENCES "public"."Log"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityWebhookLog" ADD CONSTRAINT "EntityWebhookLog_webhookId_fkey" FOREIGN KEY ("webhookId") REFERENCES "public"."EntityWebhook"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityRelationship" ADD CONSTRAINT "EntityRelationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityRelationship" ADD CONSTRAINT "EntityRelationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityRelationship" ADD CONSTRAINT "EntityRelationship_childEntityViewId_fkey" FOREIGN KEY ("childEntityViewId") REFERENCES "public"."EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityRelationship" ADD CONSTRAINT "EntityRelationship_parentEntityViewId_fkey" FOREIGN KEY ("parentEntityViewId") REFERENCES "public"."EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SampleCustomEntity" ADD CONSTRAINT "SampleCustomEntity_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowRelationship" ADD CONSTRAINT "RowRelationship_relationshipId_fkey" FOREIGN KEY ("relationshipId") REFERENCES "public"."EntityRelationship"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowRelationship" ADD CONSTRAINT "RowRelationship_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowRelationship" ADD CONSTRAINT "RowRelationship_childId_fkey" FOREIGN KEY ("childId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Row" ADD CONSTRAINT "Row_createdByApiKeyId_fkey" FOREIGN KEY ("createdByApiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Row" ADD CONSTRAINT "Row_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Row" ADD CONSTRAINT "Row_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Row" ADD CONSTRAINT "Row_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowValue" ADD CONSTRAINT "RowValue_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowValue" ADD CONSTRAINT "RowValue_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowValueMultiple" ADD CONSTRAINT "RowValueMultiple_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "public"."RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowValueRange" ADD CONSTRAINT "RowValueRange_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "public"."RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowPermission" ADD CONSTRAINT "RowPermission_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowPermission" ADD CONSTRAINT "RowPermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowPermission" ADD CONSTRAINT "RowPermission_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowPermission" ADD CONSTRAINT "RowPermission_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowPermission" ADD CONSTRAINT "RowPermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowMedia" ADD CONSTRAINT "RowMedia_rowValueId_fkey" FOREIGN KEY ("rowValueId") REFERENCES "public"."RowValue"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowTag" ADD CONSTRAINT "RowTag_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowTag" ADD CONSTRAINT "RowTag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "public"."EntityTag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowComment" ADD CONSTRAINT "RowComment_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowComment" ADD CONSTRAINT "RowComment_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowCommentReaction" ADD CONSTRAINT "RowCommentReaction_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowCommentReaction" ADD CONSTRAINT "RowCommentReaction_rowCommentId_fkey" FOREIGN KEY ("rowCommentId") REFERENCES "public"."RowComment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowTask" ADD CONSTRAINT "RowTask_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowTask" ADD CONSTRAINT "RowTask_completedByUserId_fkey" FOREIGN KEY ("completedByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowTask" ADD CONSTRAINT "RowTask_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RowTask" ADD CONSTRAINT "RowTask_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityTemplate" ADD CONSTRAINT "EntityTemplate_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityTemplate" ADD CONSTRAINT "EntityTemplate_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupEntity" ADD CONSTRAINT "EntityGroupEntity_entityGroupId_fkey" FOREIGN KEY ("entityGroupId") REFERENCES "public"."EntityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupEntity" ADD CONSTRAINT "EntityGroupEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupEntity" ADD CONSTRAINT "EntityGroupEntity_allViewId_fkey" FOREIGN KEY ("allViewId") REFERENCES "public"."EntityView"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaComponent" ADD CONSTRAINT "FormulaComponent_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "public"."Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaLog" ADD CONSTRAINT "FormulaLog_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "public"."Formula"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaLog" ADD CONSTRAINT "FormulaLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaLog" ADD CONSTRAINT "FormulaLog_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaComponentLog" ADD CONSTRAINT "FormulaComponentLog_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FormulaComponentLog" ADD CONSTRAINT "FormulaComponentLog_formulaLogId_fkey" FOREIGN KEY ("formulaLogId") REFERENCES "public"."FormulaLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupConfiguration" ADD CONSTRAINT "EntityGroupConfiguration_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupConfiguration" ADD CONSTRAINT "EntityGroupConfiguration_entityGroupId_fkey" FOREIGN KEY ("entityGroupId") REFERENCES "public"."EntityGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupConfigurationRow" ADD CONSTRAINT "EntityGroupConfigurationRow_entityGroupConfigurationId_fkey" FOREIGN KEY ("entityGroupConfigurationId") REFERENCES "public"."EntityGroupConfiguration"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."EntityGroupConfigurationRow" ADD CONSTRAINT "EntityGroupConfigurationRow_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKeyEntity" ADD CONSTRAINT "ApiKeyEntity_apiKeyId_fkey" FOREIGN KEY ("apiKeyId") REFERENCES "public"."ApiKey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."ApiKeyEntity" ADD CONSTRAINT "ApiKeyEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSettingsRow" ADD CONSTRAINT "TenantSettingsRow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSettingsRow" ADD CONSTRAINT "TenantSettingsRow_rowId_fkey" FOREIGN KEY ("rowId") REFERENCES "public"."Row"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."FeatureFlagFilter" ADD CONSTRAINT "FeatureFlagFilter_featureFlagId_fkey" FOREIGN KEY ("featureFlagId") REFERENCES "public"."FeatureFlag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Feedback" ADD CONSTRAINT "Feedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Survey" ADD CONSTRAINT "Survey_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveyItem" ADD CONSTRAINT "SurveyItem_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveySubmission" ADD CONSTRAINT "SurveySubmission_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "public"."Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SurveySubmissionResult" ADD CONSTRAINT "SurveySubmissionResult_surveySubmissionId_fkey" FOREIGN KEY ("surveySubmissionId") REFERENCES "public"."SurveySubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseCategory" ADD CONSTRAINT "KnowledgeBaseCategory_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."KnowledgeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseCategorySection" ADD CONSTRAINT "KnowledgeBaseCategorySection_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."KnowledgeBaseCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."KnowledgeBase"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "public"."KnowledgeBaseCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_sectionId_fkey" FOREIGN KEY ("sectionId") REFERENCES "public"."KnowledgeBaseCategorySection"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticle" ADD CONSTRAINT "KnowledgeBaseArticle_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseRelatedArticle" ADD CONSTRAINT "KnowledgeBaseRelatedArticle_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "public"."KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseRelatedArticle" ADD CONSTRAINT "KnowledgeBaseRelatedArticle_relatedArticleId_fkey" FOREIGN KEY ("relatedArticleId") REFERENCES "public"."KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseViews" ADD CONSTRAINT "KnowledgeBaseViews_knowledgeBaseId_fkey" FOREIGN KEY ("knowledgeBaseId") REFERENCES "public"."KnowledgeBase"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticleViews" ADD CONSTRAINT "KnowledgeBaseArticleViews_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "public"."KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticleUpvotes" ADD CONSTRAINT "KnowledgeBaseArticleUpvotes_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "public"."KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."KnowledgeBaseArticleDownvotes" ADD CONSTRAINT "KnowledgeBaseArticleDownvotes_knowledgeBaseArticleId_fkey" FOREIGN KEY ("knowledgeBaseArticleId") REFERENCES "public"."KnowledgeBaseArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingFilter" ADD CONSTRAINT "OnboardingFilter_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingStep" ADD CONSTRAINT "OnboardingStep_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSession" ADD CONSTRAINT "OnboardingSession_onboardingId_fkey" FOREIGN KEY ("onboardingId") REFERENCES "public"."Onboarding"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSession" ADD CONSTRAINT "OnboardingSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSession" ADD CONSTRAINT "OnboardingSession_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSessionAction" ADD CONSTRAINT "OnboardingSessionAction_onboardingSessionId_fkey" FOREIGN KEY ("onboardingSessionId") REFERENCES "public"."OnboardingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSessionFilterMatch" ADD CONSTRAINT "OnboardingSessionFilterMatch_onboardingFilterId_fkey" FOREIGN KEY ("onboardingFilterId") REFERENCES "public"."OnboardingFilter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSessionFilterMatch" ADD CONSTRAINT "OnboardingSessionFilterMatch_onboardingSessionId_fkey" FOREIGN KEY ("onboardingSessionId") REFERENCES "public"."OnboardingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSessionStep" ADD CONSTRAINT "OnboardingSessionStep_onboardingSessionId_fkey" FOREIGN KEY ("onboardingSessionId") REFERENCES "public"."OnboardingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."OnboardingSessionStep" ADD CONSTRAINT "OnboardingSessionStep_stepId_fkey" FOREIGN KEY ("stepId") REFERENCES "public"."OnboardingStep"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageMetaTag" ADD CONSTRAINT "PageMetaTag_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PageBlock" ADD CONSTRAINT "PageBlock_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "public"."Page"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Permission" ADD CONSTRAINT "Permission_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "public"."Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "public"."Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Group" ADD CONSTRAINT "Group_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupUser" ADD CONSTRAINT "GroupUser_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "public"."Group"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."GroupUser" ADD CONSTRAINT "GroupUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Portal" ADD CONSTRAINT "Portal_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Portal" ADD CONSTRAINT "Portal_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUser" ADD CONSTRAINT "PortalUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUser" ADD CONSTRAINT "PortalUser_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalPage" ADD CONSTRAINT "PortalPage_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserRegistration" ADD CONSTRAINT "PortalUserRegistration_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserRegistration" ADD CONSTRAINT "PortalUserRegistration_createdPortalUserId_fkey" FOREIGN KEY ("createdPortalUserId") REFERENCES "public"."PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalSubscriptionProduct" ADD CONSTRAINT "PortalSubscriptionProduct_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalSubscriptionPrice" ADD CONSTRAINT "PortalSubscriptionPrice_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalSubscriptionPrice" ADD CONSTRAINT "PortalSubscriptionPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."PortalSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalSubscriptionFeature" ADD CONSTRAINT "PortalSubscriptionFeature_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalSubscriptionFeature" ADD CONSTRAINT "PortalSubscriptionFeature_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."PortalSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscription" ADD CONSTRAINT "PortalUserSubscription_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscription" ADD CONSTRAINT "PortalUserSubscription_portalUserId_fkey" FOREIGN KEY ("portalUserId") REFERENCES "public"."PortalUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscriptionProduct" ADD CONSTRAINT "PortalUserSubscriptionProduct_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscriptionProduct" ADD CONSTRAINT "PortalUserSubscriptionProduct_portalUserSubscriptionId_fkey" FOREIGN KEY ("portalUserSubscriptionId") REFERENCES "public"."PortalUserSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscriptionProduct" ADD CONSTRAINT "PortalUserSubscriptionProduct_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."PortalSubscriptionProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscriptionProductPrice" ADD CONSTRAINT "PortalUserSubscriptionProductPrice_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscriptionProductPrice" ADD CONSTRAINT "PortalUserSubscriptionProductPrice_portalUserSubscriptionP_fkey" FOREIGN KEY ("portalUserSubscriptionProductId") REFERENCES "public"."PortalUserSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalUserSubscriptionProductPrice" ADD CONSTRAINT "PortalUserSubscriptionProductPrice_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "public"."PortalSubscriptionPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PortalCheckoutSessionStatus" ADD CONSTRAINT "PortalCheckoutSessionStatus_portalId_fkey" FOREIGN KEY ("portalId") REFERENCES "public"."Portal"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowGroupTemplate" ADD CONSTRAINT "PromptFlowGroupTemplate_promptFlowGroupId_fkey" FOREIGN KEY ("promptFlowGroupId") REFERENCES "public"."PromptFlowGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowGroupEntity" ADD CONSTRAINT "PromptFlowGroupEntity_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowGroupEntity" ADD CONSTRAINT "PromptFlowGroupEntity_promptFlowGroupId_fkey" FOREIGN KEY ("promptFlowGroupId") REFERENCES "public"."PromptFlowGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlow" ADD CONSTRAINT "PromptFlow_inputEntityId_fkey" FOREIGN KEY ("inputEntityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlow" ADD CONSTRAINT "PromptFlow_promptFlowGroupId_fkey" FOREIGN KEY ("promptFlowGroupId") REFERENCES "public"."PromptFlowGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowInputVariable" ADD CONSTRAINT "PromptFlowInputVariable_promptFlowId_fkey" FOREIGN KEY ("promptFlowId") REFERENCES "public"."PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptTemplate" ADD CONSTRAINT "PromptTemplate_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "public"."PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowOutput" ADD CONSTRAINT "PromptFlowOutput_promptFlowId_fkey" FOREIGN KEY ("promptFlowId") REFERENCES "public"."PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowOutput" ADD CONSTRAINT "PromptFlowOutput_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "public"."Entity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowOutputMapping" ADD CONSTRAINT "PromptFlowOutputMapping_promptFlowOutputId_fkey" FOREIGN KEY ("promptFlowOutputId") REFERENCES "public"."PromptFlowOutput"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowOutputMapping" ADD CONSTRAINT "PromptFlowOutputMapping_promptTemplateId_fkey" FOREIGN KEY ("promptTemplateId") REFERENCES "public"."PromptTemplate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowOutputMapping" ADD CONSTRAINT "PromptFlowOutputMapping_propertyId_fkey" FOREIGN KEY ("propertyId") REFERENCES "public"."Property"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowExecution" ADD CONSTRAINT "PromptFlowExecution_flowId_fkey" FOREIGN KEY ("flowId") REFERENCES "public"."PromptFlow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowExecution" ADD CONSTRAINT "PromptFlowExecution_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptFlowExecution" ADD CONSTRAINT "PromptFlowExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptTemplateResult" ADD CONSTRAINT "PromptTemplateResult_flowExecutionId_fkey" FOREIGN KEY ("flowExecutionId") REFERENCES "public"."PromptFlowExecution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."PromptTemplateResult" ADD CONSTRAINT "PromptTemplateResult_templateId_fkey" FOREIGN KEY ("templateId") REFERENCES "public"."PromptTemplate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionPrice" ADD CONSTRAINT "SubscriptionPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionUsageBasedPrice" ADD CONSTRAINT "SubscriptionUsageBasedPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionUsageBasedTier" ADD CONSTRAINT "SubscriptionUsageBasedTier_subscriptionUsageBasedPriceId_fkey" FOREIGN KEY ("subscriptionUsageBasedPriceId") REFERENCES "public"."SubscriptionUsageBasedPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."SubscriptionFeature" ADD CONSTRAINT "SubscriptionFeature_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscriptionProduct" ADD CONSTRAINT "TenantSubscriptionProduct_tenantSubscriptionId_fkey" FOREIGN KEY ("tenantSubscriptionId") REFERENCES "public"."TenantSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscriptionProduct" ADD CONSTRAINT "TenantSubscriptionProduct_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "public"."SubscriptionProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_tenantSubscriptionProductId_fkey" FOREIGN KEY ("tenantSubscriptionProductId") REFERENCES "public"."TenantSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "public"."SubscriptionPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_subscriptionUsageBasedPrice_fkey" FOREIGN KEY ("subscriptionUsageBasedPriceId") REFERENCES "public"."SubscriptionUsageBasedPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."TenantSubscriptionUsageRecord" ADD CONSTRAINT "TenantSubscriptionUsageRecord_tenantSubscriptionProductPri_fkey" FOREIGN KEY ("tenantSubscriptionProductPriceId") REFERENCES "public"."TenantSubscriptionProductPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Credit" ADD CONSTRAINT "Credit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Credit" ADD CONSTRAINT "Credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."Workflow" ADD CONSTRAINT "Workflow_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlock" ADD CONSTRAINT "WorkflowBlock_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockConditionGroup" ADD CONSTRAINT "WorkflowBlockConditionGroup_workflowBlockId_fkey" FOREIGN KEY ("workflowBlockId") REFERENCES "public"."WorkflowBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockCondition" ADD CONSTRAINT "WorkflowBlockCondition_workflowBlockConditionGroupId_fkey" FOREIGN KEY ("workflowBlockConditionGroupId") REFERENCES "public"."WorkflowBlockConditionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockToBlock" ADD CONSTRAINT "WorkflowBlockToBlock_fromBlockId_fkey" FOREIGN KEY ("fromBlockId") REFERENCES "public"."WorkflowBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockToBlock" ADD CONSTRAINT "WorkflowBlockToBlock_toBlockId_fkey" FOREIGN KEY ("toBlockId") REFERENCES "public"."WorkflowBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_waitingBlockId_fkey" FOREIGN KEY ("waitingBlockId") REFERENCES "public"."WorkflowBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowExecution" ADD CONSTRAINT "WorkflowExecution_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowInputExample" ADD CONSTRAINT "WorkflowInputExample_workflowId_fkey" FOREIGN KEY ("workflowId") REFERENCES "public"."Workflow"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockExecution" ADD CONSTRAINT "WorkflowBlockExecution_workflowExecutionId_fkey" FOREIGN KEY ("workflowExecutionId") REFERENCES "public"."WorkflowExecution"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockExecution" ADD CONSTRAINT "WorkflowBlockExecution_workflowBlockId_fkey" FOREIGN KEY ("workflowBlockId") REFERENCES "public"."WorkflowBlock"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowBlockExecution" ADD CONSTRAINT "WorkflowBlockExecution_fromWorkflowBlockId_fkey" FOREIGN KEY ("fromWorkflowBlockId") REFERENCES "public"."WorkflowBlock"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowVariable" ADD CONSTRAINT "WorkflowVariable_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowVariable" ADD CONSTRAINT "WorkflowVariable_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowCredential" ADD CONSTRAINT "WorkflowCredential_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."WorkflowCredential" ADD CONSTRAINT "WorkflowCredential_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."UserRegistrationAttempt" ADD CONSTRAINT "UserRegistrationAttempt_createdTenantId_fkey" FOREIGN KEY ("createdTenantId") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TenantToTenantType" ADD CONSTRAINT "_TenantToTenantType_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_TenantToTenantType" ADD CONSTRAINT "_TenantToTenantType_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubscriptionProductToTenantType" ADD CONSTRAINT "_SubscriptionProductToTenantType_A_fkey" FOREIGN KEY ("A") REFERENCES "public"."SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."_SubscriptionProductToTenantType" ADD CONSTRAINT "_SubscriptionProductToTenantType_B_fkey" FOREIGN KEY ("B") REFERENCES "public"."TenantType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
