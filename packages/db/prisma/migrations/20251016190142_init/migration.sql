-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "emailVerified" DATETIME,
    "passwordHash" TEXT,
    "role" TEXT NOT NULL,
    "parentAdminId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "User_parentAdminId_fkey" FOREIGN KEY ("parentAdminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Chat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "number" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ChatMember" (
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("chatId", "userId"),
    CONSTRAINT "ChatMember_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "ChatMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "authorId" TEXT,
    "kind" TEXT NOT NULL,
    "seq" INTEGER NOT NULL,
    "clientId" TEXT,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "editedAt" DATETIME,
    "deletedAt" DATETIME,
    CONSTRAINT "Message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Message_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Request" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "partnerAdminId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "weightKg" DECIMAL,
    "boxPcs" INTEGER,
    "volumeM3" DECIMAL,
    "oldTrackNumber" TEXT,
    "costOfGoodsUSD" DECIMAL,
    "packingType" TEXT,
    "receiptAddress" TEXT,
    "imagesJson" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Request_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_partnerAdminId_fkey" FOREIGN KEY ("partnerAdminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Request_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shipment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "partnerAdminId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "trackingNumber" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Shipment_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Shipment_partnerAdminId_fkey" FOREIGN KEY ("partnerAdminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Shipment_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "messageId" TEXT,
    "fileName" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL,
    "objectKey" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "pages" INTEGER,
    "hash" TEXT,
    "thumbKey" TEXT,
    "ocrTextKey" TEXT,
    "sha256" TEXT,
    "isSafe" BOOLEAN NOT NULL DEFAULT true,
    "currentVerId" TEXT,
    "avClean" BOOLEAN,
    "uploadedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Attachment_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "refreshHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ip" TEXT,
    "validUntil" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    "reason" TEXT,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "EmailVerification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    CONSTRAINT "EmailVerification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "usedAt" DATETIME,
    CONSTRAINT "PasswordReset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ReferralToken" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "label" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revokedAt" DATETIME,
    CONSTRAINT "ReferralToken_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Offer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "requestId" TEXT NOT NULL,
    "partnerAdminId" TEXT NOT NULL,
    "pricePerKgUSD" DECIMAL NOT NULL,
    "insuranceUSD" DECIMAL,
    "packingUSD" DECIMAL,
    "deliveryDays" INTEGER,
    "deliveryMethod" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Offer_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "Request" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Offer_partnerAdminId_fkey" FOREIGN KEY ("partnerAdminId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "QRLabel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "shipmentId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "pdfKey" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "QRLabel_shipmentId_fkey" FOREIGN KEY ("shipmentId") REFERENCES "Shipment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChatRead" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "maxSeq" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ChatRead_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChatRead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShipmentTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "byUserId" TEXT NOT NULL,
    "reason" TEXT,
    "meta" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ShipmentTransition_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ShipmentTransition_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "LogisticsAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "byUserId" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "LogisticsAction_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "LogisticsAction_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Parcel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT,
    "weightKg" REAL,
    "lengthCm" REAL,
    "widthCm" REAL,
    "heightCm" REAL,
    "volumeM3" REAL,
    "pieces" INTEGER,
    "parentId" TEXT,
    "kind" TEXT NOT NULL DEFAULT 'box',
    "attrs" TEXT,
    "labelKey" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Parcel_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Parcel_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Parcel" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Parcel_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chatId" TEXT,
    "messageId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "data" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "pushEnabled" BOOLEAN NOT NULL DEFAULT true,
    "emailEnabled" BOOLEAN NOT NULL DEFAULT true,
    "quietHoursFrom" INTEGER,
    "quietHoursTo" INTEGER,
    "preferredLang" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UploadSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "totalSize" INTEGER NOT NULL,
    "partSize" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UploadSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UploadSession_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UploadPart" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "uploadId" TEXT NOT NULL,
    "partNumber" INTEGER NOT NULL,
    "size" INTEGER NOT NULL,
    "checksum" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UploadPart_uploadId_fkey" FOREIGN KEY ("uploadId") REFERENCES "UploadSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttachmentVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attachmentId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "mime" TEXT NOT NULL,
    "bytes" INTEGER NOT NULL,
    "objectKey" TEXT NOT NULL,
    "sha256" TEXT,
    "createdById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,
    CONSTRAINT "AttachmentVersion_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "AttachmentMeta" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attachmentId" TEXT NOT NULL,
    "pages" INTEGER,
    "width" INTEGER,
    "height" INTEGER,
    "ocrDone" BOOLEAN NOT NULL DEFAULT false,
    "ocrLang" TEXT,
    "avScannedAt" DATETIME,
    "exifStripped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "AttachmentMeta_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Annotation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "attachmentId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "page" INTEGER,
    "rect" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Annotation_attachmentId_fkey" FOREIGN KEY ("attachmentId") REFERENCES "Attachment" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PackingPreset" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "dims" TEXT NOT NULL,
    "priceRules" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PackingPreset_adminId_fkey" FOREIGN KEY ("adminId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FinanceLedger" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "opKind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "isAuto" BOOLEAN NOT NULL DEFAULT false,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FinanceLedger_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FinanceLedger_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMProfile" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "referredBy" TEXT,
    "notes" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CRMProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMContact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "primary" BOOLEAN NOT NULL DEFAULT false,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CRMContact_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CRMProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMAddress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "label" TEXT,
    "country" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "zip" TEXT,
    "line1" TEXT NOT NULL,
    "line2" TEXT,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CRMAddress_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CRMProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMTag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "color" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CRMTag_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CRMProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMKPI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "ltv" REAL NOT NULL DEFAULT 0,
    "arpu" REAL NOT NULL DEFAULT 0,
    "ordersCount" INTEGER NOT NULL DEFAULT 0,
    "openShipments" INTEGER NOT NULL DEFAULT 0,
    "lastActivity" DATETIME,
    "debtAmount" REAL,
    "debtCurrency" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CRMKPI_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CRMProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMTimelineEvent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "chatId" TEXT,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "subtitle" TEXT,
    "refType" TEXT,
    "refId" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CRMTimelineEvent_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CRMProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CRMTimelineEvent_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CRMTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "dueAt" DATETIME,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "assigneeId" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CRMTask_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "CRMProfile" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSReceivingSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "actorId" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WMSReceivingSession_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSReceivingSession_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSReceivingItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sessionId" TEXT NOT NULL,
    "sku" TEXT,
    "name" TEXT,
    "expectedQty" INTEGER NOT NULL DEFAULT 0,
    "receivedQty" INTEGER NOT NULL DEFAULT 0,
    "damage" TEXT NOT NULL DEFAULT 'NONE',
    "notes" TEXT,
    "sourceLabel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WMSReceivingItem_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "WMSReceivingSession" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSReconcileDiff" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "receivingItemId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "deltaUnits" INTEGER NOT NULL,
    "comment" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WMSReconcileDiff_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSReconcileDiff_receivingItemId_fkey" FOREIGN KEY ("receivingItemId") REFERENCES "WMSReceivingItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSQAIssue" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "receivingItemId" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "comment" TEXT,
    "resolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WMSQAIssue_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSQAIssue_receivingItemId_fkey" FOREIGN KEY ("receivingItemId") REFERENCES "WMSReceivingItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSBin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "rack" TEXT NOT NULL,
    "shelf" TEXT NOT NULL,
    "cell" TEXT NOT NULL,
    "capacity" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "WMSPutawayMove" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "receivingItemId" TEXT NOT NULL,
    "binId" TEXT NOT NULL,
    "qty" INTEGER NOT NULL,
    "movedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "byUserId" TEXT NOT NULL,
    CONSTRAINT "WMSPutawayMove_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSPutawayMove_receivingItemId_fkey" FOREIGN KEY ("receivingItemId") REFERENCES "WMSReceivingItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSPutawayMove_binId_fkey" FOREIGN KEY ("binId") REFERENCES "WMSBin" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "WMSPutawayMove_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSPhoto" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "url" TEXT,
    "uploading" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WMSPhoto_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WMSReceivingItem" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSPhoto_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WMSReconcileDiff" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSPhoto_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WMSQAIssue" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "WMSPhoto_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WMSReturnCase" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "WMSReturnCase" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "initiatedBy" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "items" TEXT NOT NULL,
    "history" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "WMSReturnCase_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderFSMState" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "gates" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderFSMState_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderFSMTransition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "stateId" TEXT NOT NULL,
    "from" TEXT NOT NULL,
    "to" TEXT NOT NULL,
    "byUserId" TEXT NOT NULL,
    "reason" TEXT,
    "metadata" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderFSMTransition_stateId_fkey" FOREIGN KEY ("stateId") REFERENCES "OrderFSMState" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderFSMTransition_byUserId_fkey" FOREIGN KEY ("byUserId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderRACI" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "responsible" TEXT,
    "accountable" TEXT,
    "consulted" TEXT,
    "informed" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderRACI_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderSLA" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "stage" TEXT NOT NULL,
    "targetHours" INTEGER NOT NULL,
    "startedAt" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "escalated" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "OrderSLA_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChangeRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "chatId" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "fields" TEXT NOT NULL,
    "baseVersion" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" DATETIME,
    "rejectedAt" DATETIME,
    CONSTRAINT "ChangeRequest_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChangeRequest_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ChangeRequestApproval" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changeRequestId" TEXT NOT NULL,
    "approverId" TEXT NOT NULL,
    "decision" TEXT NOT NULL,
    "comment" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChangeRequestApproval_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ChangeRequestApproval_approverId_fkey" FOREIGN KEY ("approverId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OrderVersion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "changeRequestId" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "version" INTEGER NOT NULL,
    "snapshot" TEXT NOT NULL,
    "diff" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "OrderVersion_changeRequestId_fkey" FOREIGN KEY ("changeRequestId") REFERENCES "ChangeRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderVersion_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "Chat" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_parentAdminId_idx" ON "User"("parentAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "Chat_number_key" ON "Chat"("number");

-- CreateIndex
CREATE INDEX "Chat_updatedAt_idx" ON "Chat"("updatedAt");

-- CreateIndex
CREATE INDEX "ChatMember_userId_idx" ON "ChatMember"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_clientId_key" ON "Message"("clientId");

-- CreateIndex
CREATE INDEX "Message_chatId_createdAt_idx" ON "Message"("chatId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Message_chatId_seq_key" ON "Message"("chatId", "seq");

-- CreateIndex
CREATE UNIQUE INDEX "Request_chatId_key" ON "Request"("chatId");

-- CreateIndex
CREATE INDEX "Request_partnerAdminId_idx" ON "Request"("partnerAdminId");

-- CreateIndex
CREATE INDEX "Request_createdById_idx" ON "Request"("createdById");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_chatId_key" ON "Shipment"("chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Shipment_trackingNumber_key" ON "Shipment"("trackingNumber");

-- CreateIndex
CREATE INDEX "Shipment_partnerAdminId_idx" ON "Shipment"("partnerAdminId");

-- CreateIndex
CREATE INDEX "Shipment_createdById_idx" ON "Shipment"("createdById");

-- CreateIndex
CREATE INDEX "Shipment_status_idx" ON "Shipment"("status");

-- CreateIndex
CREATE INDEX "Attachment_chatId_idx" ON "Attachment"("chatId");

-- CreateIndex
CREATE INDEX "Attachment_messageId_idx" ON "Attachment"("messageId");

-- CreateIndex
CREATE INDEX "Attachment_hash_idx" ON "Attachment"("hash");

-- CreateIndex
CREATE INDEX "Attachment_uploadedAt_idx" ON "Attachment"("uploadedAt");

-- CreateIndex
CREATE INDEX "Attachment_sha256_idx" ON "Attachment"("sha256");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_validUntil_idx" ON "Session"("validUntil");

-- CreateIndex
CREATE UNIQUE INDEX "EmailVerification_tokenHash_key" ON "EmailVerification"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_tokenHash_key" ON "PasswordReset"("tokenHash");

-- CreateIndex
CREATE UNIQUE INDEX "ReferralToken_token_key" ON "ReferralToken"("token");

-- CreateIndex
CREATE INDEX "ReferralToken_adminId_idx" ON "ReferralToken"("adminId");

-- CreateIndex
CREATE UNIQUE INDEX "Offer_requestId_key" ON "Offer"("requestId");

-- CreateIndex
CREATE INDEX "Offer_partnerAdminId_idx" ON "Offer"("partnerAdminId");

-- CreateIndex
CREATE UNIQUE INDEX "QRLabel_shipmentId_key" ON "QRLabel"("shipmentId");

-- CreateIndex
CREATE INDEX "ChatRead_chatId_idx" ON "ChatRead"("chatId");

-- CreateIndex
CREATE INDEX "ChatRead_userId_idx" ON "ChatRead"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ChatRead_chatId_userId_key" ON "ChatRead"("chatId", "userId");

-- CreateIndex
CREATE INDEX "ShipmentTransition_chatId_createdAt_idx" ON "ShipmentTransition"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "ShipmentTransition_byUserId_idx" ON "ShipmentTransition"("byUserId");

-- CreateIndex
CREATE INDEX "LogisticsAction_chatId_createdAt_idx" ON "LogisticsAction"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "LogisticsAction_type_idx" ON "LogisticsAction"("type");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_code_key" ON "Parcel"("code");

-- CreateIndex
CREATE INDEX "Parcel_chatId_idx" ON "Parcel"("chatId");

-- CreateIndex
CREATE INDEX "Parcel_parentId_idx" ON "Parcel"("parentId");

-- CreateIndex
CREATE UNIQUE INDEX "Parcel_chatId_code_key" ON "Parcel"("chatId", "code");

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_chatId_idx" ON "Notification"("chatId");

-- CreateIndex
CREATE INDEX "Notification_messageId_idx" ON "Notification"("messageId");

-- CreateIndex
CREATE INDEX "Notification_userId_isRead_idx" ON "Notification"("userId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_userId_createdAt_idx" ON "Notification"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UploadSession_userId_idx" ON "UploadSession"("userId");

-- CreateIndex
CREATE INDEX "UploadSession_chatId_idx" ON "UploadSession"("chatId");

-- CreateIndex
CREATE INDEX "UploadSession_status_idx" ON "UploadSession"("status");

-- CreateIndex
CREATE INDEX "UploadSession_createdAt_idx" ON "UploadSession"("createdAt");

-- CreateIndex
CREATE INDEX "UploadPart_uploadId_idx" ON "UploadPart"("uploadId");

-- CreateIndex
CREATE INDEX "UploadPart_status_idx" ON "UploadPart"("status");

-- CreateIndex
CREATE UNIQUE INDEX "UploadPart_uploadId_partNumber_key" ON "UploadPart"("uploadId", "partNumber");

-- CreateIndex
CREATE INDEX "AttachmentVersion_attachmentId_idx" ON "AttachmentVersion"("attachmentId");

-- CreateIndex
CREATE INDEX "AttachmentVersion_createdById_idx" ON "AttachmentVersion"("createdById");

-- CreateIndex
CREATE INDEX "AttachmentVersion_createdAt_idx" ON "AttachmentVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "AttachmentMeta_attachmentId_key" ON "AttachmentMeta"("attachmentId");

-- CreateIndex
CREATE INDEX "AttachmentMeta_attachmentId_idx" ON "AttachmentMeta"("attachmentId");

-- CreateIndex
CREATE INDEX "AttachmentMeta_ocrDone_idx" ON "AttachmentMeta"("ocrDone");

-- CreateIndex
CREATE INDEX "Annotation_attachmentId_idx" ON "Annotation"("attachmentId");

-- CreateIndex
CREATE INDEX "Annotation_authorId_idx" ON "Annotation"("authorId");

-- CreateIndex
CREATE INDEX "Annotation_createdAt_idx" ON "Annotation"("createdAt");

-- CreateIndex
CREATE INDEX "PackingPreset_adminId_idx" ON "PackingPreset"("adminId");

-- CreateIndex
CREATE INDEX "PackingPreset_isDefault_idx" ON "PackingPreset"("isDefault");

-- CreateIndex
CREATE INDEX "FinanceLedger_chatId_idx" ON "FinanceLedger"("chatId");

-- CreateIndex
CREATE INDEX "FinanceLedger_userId_idx" ON "FinanceLedger"("userId");

-- CreateIndex
CREATE INDEX "FinanceLedger_opKind_idx" ON "FinanceLedger"("opKind");

-- CreateIndex
CREATE INDEX "FinanceLedger_isAuto_idx" ON "FinanceLedger"("isAuto");

-- CreateIndex
CREATE INDEX "FinanceLedger_createdAt_idx" ON "FinanceLedger"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "CRMProfile_userId_key" ON "CRMProfile"("userId");

-- CreateIndex
CREATE INDEX "CRMProfile_kind_idx" ON "CRMProfile"("kind");

-- CreateIndex
CREATE INDEX "CRMProfile_referredBy_idx" ON "CRMProfile"("referredBy");

-- CreateIndex
CREATE INDEX "CRMContact_profileId_idx" ON "CRMContact"("profileId");

-- CreateIndex
CREATE INDEX "CRMContact_kind_idx" ON "CRMContact"("kind");

-- CreateIndex
CREATE INDEX "CRMAddress_profileId_idx" ON "CRMAddress"("profileId");

-- CreateIndex
CREATE INDEX "CRMAddress_isDefault_idx" ON "CRMAddress"("isDefault");

-- CreateIndex
CREATE INDEX "CRMTag_profileId_idx" ON "CRMTag"("profileId");

-- CreateIndex
CREATE UNIQUE INDEX "CRMKPI_profileId_key" ON "CRMKPI"("profileId");

-- CreateIndex
CREATE INDEX "CRMKPI_profileId_idx" ON "CRMKPI"("profileId");

-- CreateIndex
CREATE INDEX "CRMTimelineEvent_profileId_idx" ON "CRMTimelineEvent"("profileId");

-- CreateIndex
CREATE INDEX "CRMTimelineEvent_chatId_idx" ON "CRMTimelineEvent"("chatId");

-- CreateIndex
CREATE INDEX "CRMTimelineEvent_type_idx" ON "CRMTimelineEvent"("type");

-- CreateIndex
CREATE INDEX "CRMTimelineEvent_createdAt_idx" ON "CRMTimelineEvent"("createdAt");

-- CreateIndex
CREATE INDEX "CRMTask_profileId_idx" ON "CRMTask"("profileId");

-- CreateIndex
CREATE INDEX "CRMTask_assigneeId_idx" ON "CRMTask"("assigneeId");

-- CreateIndex
CREATE INDEX "CRMTask_done_idx" ON "CRMTask"("done");

-- CreateIndex
CREATE INDEX "WMSReceivingSession_chatId_idx" ON "WMSReceivingSession"("chatId");

-- CreateIndex
CREATE INDEX "WMSReceivingSession_actorId_idx" ON "WMSReceivingSession"("actorId");

-- CreateIndex
CREATE INDEX "WMSReceivingItem_sessionId_idx" ON "WMSReceivingItem"("sessionId");

-- CreateIndex
CREATE INDEX "WMSReceivingItem_sku_idx" ON "WMSReceivingItem"("sku");

-- CreateIndex
CREATE INDEX "WMSReconcileDiff_chatId_idx" ON "WMSReconcileDiff"("chatId");

-- CreateIndex
CREATE INDEX "WMSReconcileDiff_receivingItemId_idx" ON "WMSReconcileDiff"("receivingItemId");

-- CreateIndex
CREATE INDEX "WMSReconcileDiff_type_idx" ON "WMSReconcileDiff"("type");

-- CreateIndex
CREATE INDEX "WMSQAIssue_chatId_idx" ON "WMSQAIssue"("chatId");

-- CreateIndex
CREATE INDEX "WMSQAIssue_receivingItemId_idx" ON "WMSQAIssue"("receivingItemId");

-- CreateIndex
CREATE INDEX "WMSQAIssue_severity_idx" ON "WMSQAIssue"("severity");

-- CreateIndex
CREATE UNIQUE INDEX "WMSBin_code_key" ON "WMSBin"("code");

-- CreateIndex
CREATE INDEX "WMSBin_code_idx" ON "WMSBin"("code");

-- CreateIndex
CREATE INDEX "WMSBin_area_idx" ON "WMSBin"("area");

-- CreateIndex
CREATE INDEX "WMSPutawayMove_chatId_idx" ON "WMSPutawayMove"("chatId");

-- CreateIndex
CREATE INDEX "WMSPutawayMove_receivingItemId_idx" ON "WMSPutawayMove"("receivingItemId");

-- CreateIndex
CREATE INDEX "WMSPutawayMove_binId_idx" ON "WMSPutawayMove"("binId");

-- CreateIndex
CREATE INDEX "WMSPhoto_entityType_entityId_idx" ON "WMSPhoto"("entityType", "entityId");

-- CreateIndex
CREATE INDEX "WMSReturnCase_chatId_idx" ON "WMSReturnCase"("chatId");

-- CreateIndex
CREATE INDEX "WMSReturnCase_status_idx" ON "WMSReturnCase"("status");

-- CreateIndex
CREATE UNIQUE INDEX "OrderFSMState_chatId_key" ON "OrderFSMState"("chatId");

-- CreateIndex
CREATE INDEX "OrderFSMState_chatId_idx" ON "OrderFSMState"("chatId");

-- CreateIndex
CREATE INDEX "OrderFSMState_status_idx" ON "OrderFSMState"("status");

-- CreateIndex
CREATE INDEX "OrderFSMTransition_stateId_idx" ON "OrderFSMTransition"("stateId");

-- CreateIndex
CREATE INDEX "OrderFSMTransition_byUserId_idx" ON "OrderFSMTransition"("byUserId");

-- CreateIndex
CREATE INDEX "OrderFSMTransition_createdAt_idx" ON "OrderFSMTransition"("createdAt");

-- CreateIndex
CREATE INDEX "OrderRACI_chatId_idx" ON "OrderRACI"("chatId");

-- CreateIndex
CREATE INDEX "OrderRACI_status_idx" ON "OrderRACI"("status");

-- CreateIndex
CREATE INDEX "OrderSLA_chatId_idx" ON "OrderSLA"("chatId");

-- CreateIndex
CREATE INDEX "OrderSLA_stage_idx" ON "OrderSLA"("stage");

-- CreateIndex
CREATE INDEX "OrderSLA_startedAt_idx" ON "OrderSLA"("startedAt");

-- CreateIndex
CREATE INDEX "ChangeRequest_chatId_idx" ON "ChangeRequest"("chatId");

-- CreateIndex
CREATE INDEX "ChangeRequest_orderId_idx" ON "ChangeRequest"("orderId");

-- CreateIndex
CREATE INDEX "ChangeRequest_status_idx" ON "ChangeRequest"("status");

-- CreateIndex
CREATE INDEX "ChangeRequest_createdBy_idx" ON "ChangeRequest"("createdBy");

-- CreateIndex
CREATE INDEX "ChangeRequestApproval_changeRequestId_idx" ON "ChangeRequestApproval"("changeRequestId");

-- CreateIndex
CREATE INDEX "ChangeRequestApproval_approverId_idx" ON "ChangeRequestApproval"("approverId");

-- CreateIndex
CREATE INDEX "OrderVersion_changeRequestId_idx" ON "OrderVersion"("changeRequestId");

-- CreateIndex
CREATE INDEX "OrderVersion_chatId_idx" ON "OrderVersion"("chatId");

-- CreateIndex
CREATE INDEX "OrderVersion_version_idx" ON "OrderVersion"("version");
