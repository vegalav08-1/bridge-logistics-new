# @yp/search

Search and indexing package for YP Bridge.

## Features

- Meilisearch integration
- Index management for chats, messages, attachments, finance
- ACL-based filtering
- Search API with suggestions
- Analytics and dashboards

## Usage

```typescript
import { SearchClient } from '@yp/search';

const client = new SearchClient();
await client.search('query', { scope: 'all' });
```




