# Chat System Enhancements Integration Guide

## Overview

This document describes the integration of three major chat system enhancements:

1. **MS-01**: Master-Child chat relationships with ACL
2. **QR-01**: QR code generation and access control  
3. **CONF-01**: Configurator with automatic chat publishing

## Feature Flags

All enhancements are controlled by feature flags in `apps/web/src/lib/flags.ts`:

```typescript
export const CHAT_MERGE_SPLIT_V2 = true;    // Master-child chats
export const CHAT_QR_ACCESS_V2 = true;      // QR codes and access
export const CHAT_LABEL_PDF_V2 = true;      // PDF labels with client codes
export const CHAT_CONFIGURATOR_V1 = true;   // Configurator calculator
```

## MS-01: Master-Child Chat System

### Database Schema

New tables added in `db/migrations/2025_10_21_002_chat_master_child.sql`:

- `chat_link`: Master-child relationships
- `chat_master_acl`: Access control for master chats
- `chat_access_request`: Requests for foreign branch access

### API Endpoints

- `POST /api/chat/merge` - Create master chat and link children
- `POST /api/chat/split` - Remove child from master
- `POST /api/chat/master/arrived` - Cascade ARRIVED status
- `GET /api/chat/master/:chatId/children` - List child chats

### UI Components

- `MasterChatHeader`: Header for master chats with cascade button
- `ChildChatsDrawer`: List of child chats with search/filter
- `ChatEnhancements`: Main integration component

### Integration Points

1. **Chat Creation**: When creating shipments, check if user wants to create master chat
2. **Status Updates**: Master status changes cascade to children
3. **Access Control**: Only admins can see master chats based on ACL rules

## QR-01: QR Code and Label System

### QR Payload Format

```json
{
  "v": 2,
  "type": "CHAT_ACCESS", 
  "chat": "chat-id",
  "order": "shipment-id",
  "branch": "branch-id",
  "client_code": "0421"
}
```

### API Endpoints

- `GET /api/chat/resolve-qr?code=BR20251021_7_10(0421)` - Resolve QR to chat
- `POST /api/chat/qr/request-access` - Request access to foreign branch
- `GET /api/labels/:shipmentId/pdf` - Get PDF label URL
- `GET /api/labels/:shipmentId/png` - Get PNG label URL

### UI Components

- `QRAccessCard`: Display QR access information
- `QRChatGenerator`: Generate and parse QR codes
- Integration with existing label system

### Integration Points

1. **Shipment Creation**: Auto-generate QR and labels
2. **QR Scanning**: Resolve to chat access with branch checking
3. **Access Requests**: Handle foreign branch access requests

## CONF-01: Configurator System

### Calculation Engine

- Volume weight calculation with different divisors (air/sea/truck)
- Density and chargeable weight computation
- Human-readable summary generation

### API Endpoints

- `POST /api/configurator/calc` - Calculate cargo metrics
- `POST /api/chat/:chatId/configurator/publish` - Publish to chat

### UI Components

- `ConfiguratorDrawer`: Full-featured calculator interface
- `ChatConfigurator`: Calculation engine
- Integration with system messages

### Integration Points

1. **Chat Interface**: Configurator button in chat
2. **System Messages**: Auto-publish calculation results
3. **Validation**: Input constraints and error handling

## System Message Types

New system message types added:

- `master`: Master chat operations
- `configurator`: Configurator calculations
- `access_request`: Access requests for foreign branches

## Security Considerations

### ACL Rules

1. **Master Chats**: Only creator or branch admins can access
2. **QR Access**: Branch validation required
3. **Configurator**: Admin/Employee roles for publishing

### Audit Logging

All operations are logged in `audit_log` table:
- Master-child operations
- QR access attempts
- Configurator publications
- Access requests

## Testing Strategy

### Unit Tests

- `configurator.test.ts`: Calculation engine tests
- `qr-generator.test.ts`: QR code generation/parsing tests

### Integration Tests

- Master-child relationship flows
- QR access control flows
- Configurator publication flows

### E2E Tests

- Full master chat creation and management
- QR scanning and access control
- Configurator calculation and publishing

## Migration Strategy

### Phase 1: Database Setup
1. Run migration scripts
2. Update existing chats with new fields
3. Set up ACL for existing master chats

### Phase 2: Feature Rollout
1. Enable flags for development
2. Test with sample data
3. Gradual production rollout

### Phase 3: Full Integration
1. Update all chat interfaces
2. Train users on new features
3. Monitor performance and usage

## Performance Considerations

### Database Indexes

- `idx_chat_link_master`: Fast master chat queries
- `idx_shipment_label_code`: Quick QR lookups
- `idx_chat_access_request_chat`: Access request queries

### Caching Strategy

- QR payloads cached for quick access
- Master chat ACL cached per session
- Configurator results cached temporarily

## Monitoring and Metrics

### Key Metrics

- Master chat creation rate
- QR scan success rate
- Configurator usage frequency
- Access request approval rate

### Error Tracking

- Failed QR resolutions
- Configurator calculation errors
- ACL access denials
- System message failures

## Future Enhancements

### Planned Features

1. **Advanced ACL**: Role-based permissions
2. **QR Analytics**: Usage tracking and insights
3. **Configurator Templates**: Saved calculation presets
4. **Mobile QR Scanner**: Native app integration

### API Extensions

- Webhook support for external integrations
- GraphQL API for complex queries
- Real-time updates via WebSocket
