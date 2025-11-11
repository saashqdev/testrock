-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "avatar" TEXT,
    "phone" TEXT,
    "defaultTenantId" TEXT,
    "verifyToken" TEXT,
    "locale" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tenant" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "icon" TEXT,
    "subscriptionId" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Tenant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUser" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "TenantUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantUserInvitation" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "pending" BOOLEAN NOT NULL,
    "createdUserId" TEXT,
    "fromUserId" TEXT,

    CONSTRAINT "TenantUserInvitation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRegistrationAttempt" (
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
CREATE TABLE "AppConfiguration" (
    "id" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "theme" TEXT,
    "authRequireEmailVerification" BOOLEAN NOT NULL DEFAULT false,
    "authRequireOrganization" BOOLEAN NOT NULL DEFAULT true,
    "authRequireName" BOOLEAN NOT NULL DEFAULT true,
    "analyticsSimpleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsPlausibleAnalytics" BOOLEAN NOT NULL DEFAULT false,
    "analyticsGoogleAnalyticsTrackingId" TEXT,
    "subscriptionRequired" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionAllowSubscribeBeforeSignUp" BOOLEAN NOT NULL DEFAULT true,
    "subscriptionAllowSignUpBeforeSubscribe" BOOLEAN NOT NULL DEFAULT true,
    "brandingLogo" TEXT,
    "brandingLogoDarkMode" TEXT,
    "brandingIcon" TEXT,
    "brandingIconDarkMode" TEXT,
    "brandingFavicon" TEXT,
    "headScripts" TEXT,
    "bodyScripts" TEXT,

    CONSTRAINT "AppConfiguration_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
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
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Permission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RolePermission" (
    "id" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "permissionId" TEXT NOT NULL,

    CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRole" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,
    "tenantId" TEXT,

    CONSTRAINT "UserRole_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionProduct" (
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
CREATE TABLE "SubscriptionPrice" (
    "id" TEXT NOT NULL,
    "subscriptionProductId" TEXT NOT NULL,
    "stripeId" TEXT NOT NULL,
    "type" INTEGER NOT NULL,
    "billingPeriod" INTEGER NOT NULL,
    "price" DECIMAL(65,30) NOT NULL,
    "currency" TEXT NOT NULL,
    "trialDays" INTEGER NOT NULL,
    "active" BOOLEAN NOT NULL,

    CONSTRAINT "SubscriptionPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionUsageBasedPrice" (
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
CREATE TABLE "SubscriptionUsageBasedTier" (
    "id" TEXT NOT NULL,
    "subscriptionUsageBasedPriceId" TEXT NOT NULL,
    "from" INTEGER NOT NULL,
    "to" INTEGER,
    "perUnitPrice" DECIMAL(65,30),
    "flatFeePrice" DECIMAL(65,30),

    CONSTRAINT "SubscriptionUsageBasedTier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubscriptionFeature" (
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
CREATE TABLE "TenantSubscription" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "stripeCustomerId" TEXT,

    CONSTRAINT "TenantSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscriptionProduct" (
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
CREATE TABLE "TenantSubscriptionProductPrice" (
    "id" TEXT NOT NULL,
    "tenantSubscriptionProductId" TEXT NOT NULL,
    "subscriptionPriceId" TEXT,
    "subscriptionUsageBasedPriceId" TEXT,

    CONSTRAINT "TenantSubscriptionProductPrice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TenantSubscriptionUsageRecord" (
    "id" TEXT NOT NULL,
    "tenantSubscriptionProductPriceId" TEXT NOT NULL,
    "timestamp" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "stripeSubscriptionItemId" TEXT,

    CONSTRAINT "TenantSubscriptionUsageRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CheckoutSessionStatus" (
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
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tenantId" TEXT NOT NULL,
    "userId" TEXT,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "objectId" TEXT,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Tenant_slug_key" ON "Tenant"("slug");

-- CreateIndex
CREATE INDEX "Tenant_slug_idx" ON "Tenant"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUser_tenantId_userId_key" ON "TenantUser"("tenantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "TenantUserInvitation_createdUserId_key" ON "TenantUserInvitation"("createdUserId");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistrationAttempt_email_key" ON "UserRegistrationAttempt"("email");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistrationAttempt_token_key" ON "UserRegistrationAttempt"("token");

-- CreateIndex
CREATE UNIQUE INDEX "UserRegistrationAttempt_createdTenantId_key" ON "UserRegistrationAttempt"("createdTenantId");

-- CreateIndex
CREATE UNIQUE INDEX "Role_name_key" ON "Role"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Permission_name_key" ON "Permission"("name");

-- CreateIndex
CREATE UNIQUE INDEX "TenantSubscription_tenantId_key" ON "TenantSubscription"("tenantId");

-- CreateIndex
CREATE UNIQUE INDEX "CheckoutSessionStatus_id_key" ON "CheckoutSessionStatus"("id");

-- CreateIndex
CREATE INDEX "Credit_tenantId_userId_idx" ON "Credit"("tenantId", "userId");

-- CreateIndex
CREATE INDEX "Credit_tenantId_createdAt_idx" ON "Credit"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUser" ADD CONSTRAINT "TenantUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_fromUserId_fkey" FOREIGN KEY ("fromUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_createdUserId_fkey" FOREIGN KEY ("createdUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantUserInvitation" ADD CONSTRAINT "TenantUserInvitation_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRegistrationAttempt" ADD CONSTRAINT "UserRegistrationAttempt_createdTenantId_fkey" FOREIGN KEY ("createdTenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "Permission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RolePermission" ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "Role"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRole" ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionPrice" ADD CONSTRAINT "SubscriptionPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsageBasedPrice" ADD CONSTRAINT "SubscriptionUsageBasedPrice_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionUsageBasedTier" ADD CONSTRAINT "SubscriptionUsageBasedTier_subscriptionUsageBasedPriceId_fkey" FOREIGN KEY ("subscriptionUsageBasedPriceId") REFERENCES "SubscriptionUsageBasedPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubscriptionFeature" ADD CONSTRAINT "SubscriptionFeature_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscription" ADD CONSTRAINT "TenantSubscription_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProduct" ADD CONSTRAINT "TenantSubscriptionProduct_tenantSubscriptionId_fkey" FOREIGN KEY ("tenantSubscriptionId") REFERENCES "TenantSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProduct" ADD CONSTRAINT "TenantSubscriptionProduct_subscriptionProductId_fkey" FOREIGN KEY ("subscriptionProductId") REFERENCES "SubscriptionProduct"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_tenantSubscriptionProductId_fkey" FOREIGN KEY ("tenantSubscriptionProductId") REFERENCES "TenantSubscriptionProduct"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_subscriptionPriceId_fkey" FOREIGN KEY ("subscriptionPriceId") REFERENCES "SubscriptionPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionProductPrice" ADD CONSTRAINT "TenantSubscriptionProductPrice_subscriptionUsageBasedPrice_fkey" FOREIGN KEY ("subscriptionUsageBasedPriceId") REFERENCES "SubscriptionUsageBasedPrice"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TenantSubscriptionUsageRecord" ADD CONSTRAINT "TenantSubscriptionUsageRecord_tenantSubscriptionProductPri_fkey" FOREIGN KEY ("tenantSubscriptionProductPriceId") REFERENCES "TenantSubscriptionProductPrice"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
