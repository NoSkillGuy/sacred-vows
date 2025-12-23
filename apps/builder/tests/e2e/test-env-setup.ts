/**
 * Test Environment Setup Utilities
 * Helper functions for setting up and managing test infrastructure
 */

import { S3Client, CreateBucketCommand, HeadBucketCommand, ListObjectsV2Command, DeleteObjectCommand } from '@aws-sdk/client-s3';

const MINIO_ENDPOINT = process.env.MINIO_ENDPOINT || 'http://localhost:9000';
const MINIO_ACCESS_KEY = process.env.MINIO_ACCESS_KEY || 'minioadmin';
const MINIO_SECRET_KEY = process.env.MINIO_SECRET_KEY || 'minioadmin';
const FIRESTORE_EMULATOR_HOST = process.env.FIRESTORE_EMULATOR_HOST || 'localhost:8080';

// Test buckets
const TEST_BUCKETS = [
  'sacred-vows-assets-test',
  'sacred-vows-published-test',
  'sacred-vows-public-assets-test',
];

/**
 * Create S3 client for MinIO
 */
function createS3Client(): S3Client {
  return new S3Client({
    endpoint: MINIO_ENDPOINT,
    region: 'us-east-1',
    credentials: {
      accessKeyId: MINIO_ACCESS_KEY,
      secretAccessKey: MINIO_SECRET_KEY,
    },
    forcePathStyle: true, // Required for MinIO
  });
}

/**
 * Check if a bucket exists
 */
async function bucketExists(client: S3Client, bucketName: string): Promise<boolean> {
  try {
    await client.send(new HeadBucketCommand({ Bucket: bucketName }));
    return true;
  } catch (error: any) {
    if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
      return false;
    }
    throw error;
  }
}

/**
 * Create a bucket if it doesn't exist
 */
export async function ensureBucketExists(bucketName: string): Promise<void> {
  const client = createS3Client();
  
  const exists = await bucketExists(client, bucketName);
  if (exists) {
    console.log(`✓ Bucket ${bucketName} already exists`);
    return;
  }

  try {
    await client.send(new CreateBucketCommand({ Bucket: bucketName }));
    console.log(`✓ Created bucket: ${bucketName}`);
  } catch (error: any) {
    // Bucket might have been created by another process
    if (error.name === 'BucketAlreadyExists' || error.name === 'BucketAlreadyOwnedByYou') {
      console.log(`✓ Bucket ${bucketName} already exists (created by another process)`);
    } else {
      throw new Error(`Failed to create bucket ${bucketName}: ${error.message}`);
    }
  }
}

/**
 * Initialize all test buckets
 */
export async function initializeTestBuckets(): Promise<void> {
  console.log('Initializing test buckets...');
  
  for (const bucket of TEST_BUCKETS) {
    await ensureBucketExists(bucket);
  }
  
  console.log('✓ All test buckets initialized');
}

/**
 * Verify Firestore emulator is running
 */
export async function verifyFirestoreEmulator(): Promise<void> {
  const url = `http://${FIRESTORE_EMULATOR_HOST}`;
  
  try {
    const response = await fetch(url, { method: 'GET' });
    if (!response.ok && response.status !== 404) {
      // Firestore emulator might not have a root endpoint, but if we get a response, it's running
      console.log('✓ Firestore emulator appears to be running');
      return;
    }
    console.log('✓ Firestore emulator appears to be running');
  } catch (error: any) {
    throw new Error(
      `Firestore emulator is not accessible at ${url}. ` +
      `Please ensure it's running (e.g., via docker-compose up -d firestore-emulator). ` +
      `Error: ${error.message}`
    );
  }
}

/**
 * Verify MinIO is running
 */
export async function verifyMinIO(): Promise<void> {
  try {
    const client = createS3Client();
    // Try to list buckets - this will fail if MinIO is not accessible
    // We use a non-existent bucket to test connectivity
    try {
      await client.send(new HeadBucketCommand({ Bucket: 'test-connection' }));
    } catch (error: any) {
      // We expect this to fail (bucket doesn't exist), but if we get here,
      // it means MinIO is accessible (connection succeeded, bucket doesn't exist)
      if (error.name === 'NotFound' || error.$metadata?.httpStatusCode === 404) {
        // This is expected - bucket doesn't exist, but MinIO is accessible
        console.log('✓ MinIO is accessible');
        return;
      }
      // Other errors might indicate connectivity issues
      throw error;
    }
    console.log('✓ MinIO is accessible');
  } catch (error: any) {
    throw new Error(
      `MinIO is not accessible at ${MINIO_ENDPOINT}. ` +
      `Please ensure it's running (e.g., via docker-compose up -d minio). ` +
      `Error: ${error.message}`
    );
  }
}

/**
 * Delete all objects from a bucket
 */
export async function clearBucket(bucketName: string): Promise<void> {
  const client = createS3Client();
  
  try {
    let continuationToken: string | undefined;
    let deletedCount = 0;

    do {
      const listResponse = await client.send(
        new ListObjectsV2Command({
          Bucket: bucketName,
          ContinuationToken: continuationToken,
        })
      );

      if (listResponse.Contents && listResponse.Contents.length > 0) {
        // Delete all objects
        for (const object of listResponse.Contents) {
          if (object.Key) {
            await client.send(
              new DeleteObjectCommand({
                Bucket: bucketName,
                Key: object.Key,
              })
            );
            deletedCount++;
          }
        }
      }

      continuationToken = listResponse.NextContinuationToken;
    } while (continuationToken);

    if (deletedCount > 0) {
      console.log(`✓ Cleared ${deletedCount} objects from ${bucketName}`);
    } else {
      console.log(`✓ Bucket ${bucketName} is already empty`);
    }
  } catch (error: any) {
    // Bucket might not exist, which is fine
    if (error.name === 'NoSuchBucket') {
      console.log(`⚠ Bucket ${bucketName} does not exist (skipping cleanup)`);
    } else {
      throw new Error(`Failed to clear bucket ${bucketName}: ${error.message}`);
    }
  }
}

/**
 * Clear all test buckets
 */
export async function clearTestBuckets(): Promise<void> {
  console.log('Clearing test buckets...');
  
  for (const bucket of TEST_BUCKETS) {
    await clearBucket(bucket);
  }
  
  console.log('✓ All test buckets cleared');
}

/**
 * Initialize test environment (buckets and verify services)
 */
export async function initializeTestEnvironment(): Promise<void> {
  console.log('Initializing test environment...');
  
  await verifyFirestoreEmulator();
  await verifyMinIO();
  await initializeTestBuckets();
  
  console.log('✓ Test environment initialized');
}

