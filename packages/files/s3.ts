import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

export function createS3Client(config: S3Config): S3Client {
  return new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: config.forcePathStyle,
  });
}

export interface PresignedPutOptions {
  objectKey: string;
  contentType: string;
  expiresIn?: number; // seconds, default 300 (5 minutes)
}

export async function getPresignedPut(
  client: S3Client,
  bucket: string,
  options: PresignedPutOptions
): Promise<string> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: options.objectKey,
    ContentType: options.contentType,
    // Запрещаем публичный доступ
    ACL: undefined,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || 300,
  });
}

export interface PresignedGetOptions {
  objectKey: string;
  expiresIn?: number; // seconds, default 300 (5 minutes)
}

export async function getPresignedGet(
  client: S3Client,
  bucket: string,
  options: PresignedGetOptions
): Promise<string> {
  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: options.objectKey,
  });

  return getSignedUrl(client, command, {
    expiresIn: options.expiresIn || 300,
  });
}

export async function getObjectMetadata(
  client: S3Client,
  bucket: string,
  objectKey: string
): Promise<{ contentLength: number; contentType?: string; lastModified?: Date }> {
  const command = new HeadObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  const response = await client.send(command);
  
  return {
    contentLength: response.ContentLength || 0,
    contentType: response.ContentType,
    lastModified: response.LastModified,
  };
}

export function generateObjectKey(chatId: string, attachmentId: string, fileName: string): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `chats/${chatId}/${year}/${month}/${day}/${attachmentId}/${fileName}`;
}

export function generateThumbnailKey(attachmentId: string): string {
  return `thumbs/${attachmentId}/thumb.png`;
}

export async function deleteObject(
  client: S3Client,
  bucket: string,
  objectKey: string
): Promise<void> {
  const command = new DeleteObjectCommand({
    Bucket: bucket,
    Key: objectKey,
  });

  await client.send(command);
}

export async function uploadFile(
  client: S3Client,
  bucket: string,
  objectKey: string,
  body: Buffer | Uint8Array | string,
  contentType: string
): Promise<void> {
  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: objectKey,
    Body: body,
    ContentType: contentType,
  });

  await client.send(command);
}
