#!/usr/bin/env node
/**
 * Migration script to upload default assets to Cloudflare R2
 * 
 * Usage:
 *   npm run migrate-assets -- --env=dev
 *   npm run migrate-assets -- --env=prod
 *   npm run migrate-assets -- --env=dev --dry-run
 * 
 * Requires environment variables:
 *   R2_ACCESS_KEY_ID
 *   R2_SECRET_ACCESS_KEY
 *   PUBLIC_ASSETS_R2_BUCKET (or set via --bucket flag)
 * 
 * Optional environment variables:
 *   R2_ENDPOINT - Custom endpoint (for local MinIO, etc.)
 *   R2_ACCOUNT_ID - Required only if R2_ENDPOINT is not set (for Cloudflare R2)
 */

import { S3Client, PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { readdir, readFile, stat } from 'fs/promises';
import { join, extname, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Parse command line arguments
const args = process.argv.slice(2);
const envArg = args.find(arg => arg.startsWith('--env='));
const bucketArg = args.find(arg => arg.startsWith('--bucket='));
const dryRun = args.includes('--dry-run');

const env = envArg ? envArg.split('=')[1] : 'dev';
const bucketName = bucketArg 
  ? bucketArg.split('=')[1]
  : process.env.PUBLIC_ASSETS_R2_BUCKET || `sacred-vows-public-assets-${env}`;

// R2 configuration
const accountId = process.env.R2_ACCOUNT_ID;
const accessKeyId = process.env.R2_ACCESS_KEY_ID;
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
const customEndpoint = process.env.R2_ENDPOINT;

if (!accessKeyId || !secretAccessKey) {
  console.error('Error: Missing required environment variables:');
  console.error('  R2_ACCESS_KEY_ID');
  console.error('  R2_SECRET_ACCESS_KEY');
  process.exit(1);
}

// Use custom endpoint if provided (for local MinIO), otherwise construct Cloudflare R2 endpoint
let endpoint;
if (customEndpoint) {
  endpoint = customEndpoint;
} else {
  if (!accountId) {
    console.error('Error: Missing R2_ACCOUNT_ID (required when R2_ENDPOINT is not set)');
    process.exit(1);
  }
  endpoint = `https://${accountId}.r2.cloudflarestorage.com`;
}

// Initialize S3 client for R2
const s3Client = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
  forcePathStyle: true, // R2 requires path-style URLs
});

// Content type mapping
const contentTypeMap = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.mp3': 'audio/mpeg',
  '.mp4': 'video/mp4',
  '.json': 'application/json',
};

function getContentType(filePath) {
  const ext = extname(filePath).toLowerCase();
  return contentTypeMap[ext] || 'application/octet-stream';
}

// Asset manifest structure
const manifest = {
  defaults: {},
  layouts: {},
  music: {},
  version: '1.0.0',
  generatedAt: new Date().toISOString(),
};

/**
 * Upload a file to R2
 */
async function uploadFile(localPath, r2Key, contentType) {
  if (dryRun) {
    console.log(`[DRY RUN] Would upload: ${localPath} -> ${r2Key}`);
    return true;
  }

  try {
    // Check if file already exists
    try {
      await s3Client.send(new HeadObjectCommand({
        Bucket: bucketName,
        Key: r2Key,
      }));
      console.log(`  ✓ Already exists: ${r2Key}`);
      return true;
    } catch (err) {
      // File doesn't exist, proceed with upload
    }

    const fileContent = await readFile(localPath);
    
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: r2Key,
      Body: fileContent,
      ContentType: contentType,
      CacheControl: 'public, max-age=31536000, immutable', // 1 year cache
    }));

    console.log(`  ✓ Uploaded: ${r2Key}`);
    return true;
  } catch (error) {
    console.error(`  ✗ Failed to upload ${r2Key}:`, error.message);
    return false;
  }
}

/**
 * Recursively process directory and upload files
 */
async function processDirectory(localDir, r2Prefix, manifestSection) {
  const entries = await readdir(localDir, { withFileTypes: true });
  
  for (const entry of entries) {
    const localPath = join(localDir, entry.name);
    const r2Key = `${r2Prefix}/${entry.name}`;
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      if (!manifestSection[entry.name]) {
        manifestSection[entry.name] = {};
      }
      await processDirectory(localPath, r2Key, manifestSection[entry.name]);
    } else if (entry.isFile()) {
      // Upload file
      const contentType = getContentType(localPath);
      const success = await uploadFile(localPath, r2Key, contentType);
      
      if (success) {
        // Add to manifest
        if (!Array.isArray(manifestSection)) {
          manifestSection[entry.name] = {
            path: r2Key,
            contentType,
            size: (await stat(localPath)).size,
          };
        } else {
          manifestSection.push({
            filename: entry.name,
            path: r2Key,
            contentType,
            size: (await stat(localPath)).size,
          });
        }
      }
    }
  }
}

/**
 * Main migration function
 */
async function migrate() {
  console.log(`\n🚀 Starting asset migration to R2`);
  console.log(`   Environment: ${env}`);
  console.log(`   Bucket: ${bucketName}`);
  console.log(`   Dry run: ${dryRun ? 'YES' : 'NO'}\n`);

  // Resolve assets directory relative to this script's location (same directory)
  const scriptsDir = __dirname;
  
  // Process assets/photos (couple1, couple2)
  console.log('📸 Processing photos...');
  const photosDir = join(scriptsDir, 'assets', 'photos');
  for (const coupleDir of ['couple1', 'couple2']) {
    const couplePath = join(photosDir, coupleDir);
    try {
      await stat(couplePath);
      console.log(`  Processing ${coupleDir}...`);
      manifest.defaults[coupleDir] = {};
      await processDirectory(
        couplePath,
        `defaults/${coupleDir}`,
        manifest.defaults[coupleDir]
      );
    } catch (err) {
      console.log(`  ⚠ Skipping ${coupleDir} (not found)`);
    }
  }

  // Process layouts
  console.log('\n🎨 Processing layout previews...');
  const layoutsDir = join(scriptsDir, 'layouts');
  try {
    await stat(layoutsDir);
    manifest.layouts = {};
    await processDirectory(
      layoutsDir,
      'defaults/layouts',
      manifest.layouts
    );
  } catch (err) {
    console.log('  ⚠ Skipping layouts (not found)');
  }

  // Process music
  console.log('\n🎵 Processing music...');
  const musicDir = join(scriptsDir, 'assets', 'music');
  try {
    await stat(musicDir);
    manifest.music = {};
    await processDirectory(
      musicDir,
      'defaults/music',
      manifest.music
    );
  } catch (err) {
    console.log('  ⚠ Skipping music (not found)');
  }

  // Upload manifest
  console.log('\n📋 Uploading manifest...');
  const manifestKey = 'defaults/manifest.json';
  const manifestJson = JSON.stringify(manifest, null, 2);
  
  if (!dryRun) {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: manifestKey,
      Body: manifestJson,
      ContentType: 'application/json',
      CacheControl: 'public, max-age=3600', // 1 hour cache for manifest
    }));
    console.log(`  ✓ Uploaded manifest: ${manifestKey}`);
  } else {
    console.log(`[DRY RUN] Would upload manifest: ${manifestKey}`);
    console.log(manifestJson);
  }

  console.log('\n✅ Migration complete!');
  console.log(`\nManifest structure:`);
  console.log(JSON.stringify(manifest, null, 2));
}

// Run migration
migrate().catch((error) => {
  console.error('\n❌ Migration failed:', error);
  process.exit(1);
});

