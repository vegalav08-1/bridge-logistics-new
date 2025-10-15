# @yp/files

File upload, processing and storage utilities for YP ERP.

## Features

- S3/MinIO integration with presigned URLs
- File type validation and MIME detection
- Image thumbnail generation
- PDF preview generation
- Antivirus scanning (ClamAV)
- File hash calculation for deduplication

## Usage

```typescript
import { S3Client, getPresignedPut, getPresignedGet } from '@yp/files/s3';
import { validateMimeType, getFileType } from '@yp/files/mime';
import { generateImageThumbnail } from '@yp/files/image';
import { generatePdfThumbnail } from '@yp/files/pdf';
```

## Configuration

Set environment variables:

```env
S3_ENDPOINT=http://localhost:9000
S3_REGION=us-east-1
S3_BUCKET=yp-files
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_FORCE_PATH_STYLE=true
```