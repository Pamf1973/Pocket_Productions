import {
    S3Client,
    PutObjectCommand,
    DeleteObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env';

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3Client) {
        if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY) {
            throw new Error('AWS credentials are not configured');
        }
        s3Client = new S3Client({
            region: env.AWS_REGION,
            credentials: {
                accessKeyId: env.AWS_ACCESS_KEY_ID,
                secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
            },
        });
    }
    return s3Client;
}

export class S3Service {
    private bucket = env.AWS_S3_BUCKET;

    /**
     * Returns a presigned URL the frontend can use to upload directly to S3.
     * Expires in 5 minutes.
     */
    async getPresignedUploadUrl(
        key: string,
        contentType: string
    ): Promise<{ uploadUrl: string; publicUrl: string }> {
        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const uploadUrl = await getSignedUrl(getS3Client(), command, {
            expiresIn: 300,
        });

        const publicUrl = `https://${this.bucket}.s3.${env.AWS_REGION}.amazonaws.com/${key}`;

        return { uploadUrl, publicUrl };
    }

    /**
     * Returns a presigned URL for downloading/viewing a private S3 object.
     */
    async getPresignedDownloadUrl(key: string): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });

        return getSignedUrl(getS3Client(), command, { expiresIn: 3600 });
    }

    /**
     * Deletes an object from S3.
     */
    async deleteObject(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucket,
            Key: key,
        });
        await getS3Client().send(command);
    }

    /**
     * Generates a structured S3 key for consistent file organization.
     */
    generateKey(
        projectId: string,
        type: 'storyboard' | 'location' | 'document',
        filename: string
    ): string {
        const timestamp = Date.now();
        return `projects/${projectId}/${type}/${timestamp}-${filename}`;
    }
}

export const s3Service = new S3Service();
