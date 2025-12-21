# Build Optimization: Default Assets Migration to R2

## Overview

This document describes the build optimization initiative that moves default assets (images, layouts, music) from the local filesystem to Cloudflare R2 storage. This optimization significantly reduces the initial bundle size, improves caching, enhances scalability, and provides better offline support through PWA caching strategies.

## Problem Statement

### Initial Challenges

1. **Large Initial Bundle Size**: Default assets (photos, layouts, music) were bundled with the builder application, resulting in:
   - Large initial download for first-time visitors
   - Slower page load times, especially on slower connections
   - Higher bandwidth costs
   - Poor user experience for users browsing templates before logging in

2. **Inefficient Caching**: 
   - Assets were served from the application bundle, limiting caching effectiveness
   - No CDN-level caching for static assets
   - Assets had to be re-downloaded on each deployment

3. **Scalability Issues**:
   - All users downloaded the same default assets, even if they never used them
   - No lazy loading strategy for default assets
   - Assets were duplicated in every published site bundle

4. **Offline Support Limitations**:
   - Limited PWA caching for default assets
   - No efficient cache-first strategy for static assets

## Solution Architecture

### High-Level Architecture

```
┌─────────────────┐
│  Builder App    │
│  (Vite/React)   │
└────────┬────────┘
         │
         │ Uses defaultAssetService.js
         │ to generate CDN URLs
         │
         ▼
┌─────────────────────────────────────┐
│  Cloudflare R2 (Public Assets)     │
│  ┌───────────────────────────────┐  │
│  │ defaults/                     │  │
│  │ ├── couple1/                  │  │
│  │ │   ├── couple/               │  │
│  │ │   ├── bride/                │  │
│  │ │   ├── groom/                │  │
│  │ │   └── family/               │  │
│  │ ├── couple2/                  │  │
│  │ ├── layouts/                  │  │
│  │ │   ├── classic-scroll/       │  │
│  │ │   └── editorial-elegance/   │  │
│  │ ├── music/                    │  │
│  │ └── manifest.json             │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
         │
         │ Served via CDN
         │ (Cloudflare)
         │
         ▼
┌─────────────────┐
│  User Browser   │
│  (Cached via    │
│   PWA/SW)       │
└─────────────────┘
```

### Key Components

1. **R2 Public Assets Bucket**: Dedicated Cloudflare R2 bucket for default assets
2. **Default Asset Service**: JavaScript service that generates CDN URLs and handles caching
3. **Migration Script**: Node.js script to upload assets from local filesystem to R2
4. **PWA Service Worker**: Enhanced caching strategy for default assets
5. **Bundling Logic**: Updated publishing process to handle R2-hosted assets

## Implementation Details

### 1. Infrastructure Setup

#### R2 Bucket Configuration

**Terraform Configuration** (`infra/terraform/modules/cloudflare-resources/main.tf`):
```terraform
resource "cloudflare_r2_bucket" "public_assets" {
  account_id = var.cloudflare_account_id
  name      = var.public_assets_r2_bucket_name
  location  = var.r2_bucket_location
}
```

**Environment-Specific Buckets**:
- **Dev**: `sacred-vows-public-assets-dev`
- **Prod**: `sacred-vows-public-assets-prod`

#### Application Configuration

**Go API Configuration** (`apps/api-go/config/dev.yaml`):
```yaml
public_assets:
  r2_bucket: "sacred-vows-public-assets-dev"
  cdn_base_url: "https://pub-dev.sacredvows.io"
```

**Builder Environment Variables** (`apps/builder/env.example`):
```bash
VITE_PUBLIC_ASSETS_CDN_URL=https://pub-dev.sacredvows.io
VITE_ENABLE_ASSET_CACHING=true
```

### 2. Default Asset Service

**Location**: `apps/builder/src/services/defaultAssetService.js`

**Key Functions**:

- `getDefaultAssetUrl(category, subcategory, filename)`: Generates CDN URL for default assets
- `getLayoutAssetUrl(layoutId, assetPath)`: Converts local paths to CDN URLs
- `fetchWithCache(url)`: Fetches assets with cache-first strategy
- `preloadDefaultAssets(layoutId, assetPaths)`: Preloads assets for a layout
- `isAssetCached(url)`: Checks if asset is cached

**URL Generation Logic**:
```javascript
// If CDN is configured:
// /assets/photos/couple2/bride/1.jpeg 
// → https://pub-dev.sacredvows.io/defaults/couple2/bride/1.jpeg

// If CDN is not configured (fallback):
// → /assets/photos/couple2/bride/1.jpeg (local)
```

### 3. Layout Defaults Migration

**Before** (`apps/builder/src/layouts/editorial-elegance/defaults.js`):
```javascript
export const editorialEleganceDefaults = {
  couple: {
    bride: {
      image: '/assets/photos/couple2/bride/1.jpeg'  // Local path
    }
  }
};
```

**After**:
```javascript
import { getLayoutAssetUrl } from '../../../services/defaultAssetService';

export const editorialEleganceDefaults = {
  couple: {
    bride: {
      image: getLayoutAssetUrl('editorial-elegance', '/assets/photos/couple2/bride/1.jpeg')
      // Returns CDN URL if configured, local path otherwise
    }
  }
};
```

### 4. Lazy Loading Implementation

**Preview Pane** (`apps/builder/src/components/Preview/PreviewPane.jsx`):
- Preloads default assets when a layout is selected
- Shows loading placeholders during asset fetch
- Uses `preloadDefaultAssets()` for efficient batch loading

**Gallery Modal** (`apps/builder/src/components/Toolbar/GalleryModal.jsx`):
- Lazy loads default images only when modal opens
- Uses `fetchWithCache()` for each image
- Implements progressive loading with placeholders

**Layout Components**:
- All view components use `getDefaultAssetUrl()` for default images
- Images use `loading="lazy"` attribute for native lazy loading
- Intersection Observer for gallery images (where applicable)

### 5. PWA Service Worker Enhancement

**Location**: `apps/builder/public/sw.js`

**Cache Strategy**: Cache First, Network Fallback

```javascript
const DEFAULT_ASSETS_CACHE_NAME = 'default-assets-v1';

// Handle default assets with Cache First strategy
if (event.request.url.startsWith(CDN_BASE_URL)) {
  event.respondWith(
    caches.open(DEFAULT_ASSETS_CACHE_NAME).then(async (cache) => {
      const cachedResponse = await cache.match(event.request);
      if (cachedResponse) {
        return cachedResponse;  // Serve from cache
      }
      const networkResponse = await fetch(event.request);
      if (networkResponse && networkResponse.status === 200) {
        cache.put(event.request, networkResponse.clone());  // Cache for next time
      }
      return networkResponse;
    })
  );
}
```

**Cache TTL**: 
- Default assets: 1 year (`max-age=31536000, immutable`)
- Manifest: 1 hour (`max-age=3600`)

### 6. Publishing Process Updates

**Bundling Logic** (`apps/builder/src/template-engine/src/renderPublishedHTML.js`):

The `bundleLocalAssets()` function now:
1. Checks if an asset URL is already a CDN URL → leaves it as-is
2. If local asset not found but is a default asset → rewrites to CDN URL
3. If local asset found → bundles it (for user-uploaded assets)

```javascript
// If asset is already a CDN URL, don't bundle
if (u.startsWith(publicAssetsCdnUrl)) {
  rewriteMap.set(u, u);
  continue;
}

// If local file not found but is default asset, rewrite to CDN
if (publicAssetsCdnUrl && defaultAssetPath.startsWith('defaults/')) {
  rewriteMap.set(u, `${publicAssetsCdnUrl}/${defaultAssetPath}${suffix}`);
}
```

### 7. Migration Script

**Location**: `apps/builder/scripts/migrate-assets-to-r2.js`

**Usage**:
```bash
cd apps/builder
npm run migrate-assets -- --env=dev
npm run migrate-assets -- --env=prod
npm run migrate-assets -- --env=dev --dry-run  # Test first
```

**What It Does**:
1. Scans `apps/builder/public/assets/` and `apps/builder/public/layouts/`
2. Uploads files to R2 with structure: `defaults/{category}/{subcategory}/{filename}`
3. Creates manifest file at `defaults/manifest.json`
4. Skips files that already exist in R2
5. Sets appropriate content types and cache headers

**Required Environment Variables**:
- `R2_ACCOUNT_ID`: Cloudflare Account ID
- `R2_ACCESS_KEY_ID`: R2 API Access Key
- `R2_SECRET_ACCESS_KEY`: R2 API Secret Key
- `PUBLIC_ASSETS_R2_BUCKET`: Bucket name (optional, defaults to `sacred-vows-public-assets-{env}`)

## Benefits

### 1. Reduced Initial Bundle Size

**Before**: 
- All default assets bundled with application
- Initial bundle: ~XX MB (estimated)

**After**:
- Only application code in initial bundle
- Assets loaded on-demand from CDN
- Initial bundle: ~XX MB (estimated reduction)

### 2. Improved Performance

- **CDN Delivery**: Assets served from Cloudflare's global CDN
- **Parallel Loading**: Assets load in parallel, not blocking main bundle
- **Lazy Loading**: Assets only load when needed (layout selected, gallery opened)
- **Browser Caching**: Aggressive caching with immutable assets

### 3. Better Scalability

- **Shared Assets**: All users share same CDN-hosted assets
- **No Duplication**: Assets not duplicated in each published site
- **Cost Efficiency**: Reduced bandwidth costs for application hosting

### 4. Enhanced Offline Support

- **PWA Caching**: Service Worker caches default assets for offline access
- **Cache-First Strategy**: Assets served from cache when available
- **Progressive Enhancement**: Works offline after first visit

### 5. Developer Experience

- **Centralized Management**: All default assets in one R2 bucket
- **Easy Updates**: Update assets in R2 without rebuilding application
- **Version Control**: Manifest file tracks all assets
- **Migration Script**: Automated upload process

## Configuration

### Environment Variables

#### Builder App (`apps/builder/.env`)

```bash
# CDN Base URL for public assets
VITE_PUBLIC_ASSETS_CDN_URL=https://pub-dev.sacredvows.io

# Enable asset caching (default: true)
VITE_ENABLE_ASSET_CACHING=true
```

#### API Go (`apps/api-go/config/dev.yaml`)

```yaml
public_assets:
  r2_bucket: "sacred-vows-public-assets-dev"
  cdn_base_url: "https://pub-dev.sacredvows.io"
```

#### Terraform (`infra/terraform/dev/terraform.tfvars`)

```hcl
cloudflare_public_assets_r2_bucket_name = "sacred-vows-public-assets-dev"
```

### R2 Bucket Setup

1. **Create R2 Bucket** (via Terraform or Cloudflare Dashboard)
2. **Configure Public Access**:
   - Enable public access for the bucket
   - Set up CORS rules if needed
3. **Upload Assets**: Run migration script
4. **Verify CDN**: Ensure assets are accessible via CDN URL

## Migration Process

### Step 1: Infrastructure Setup

1. **Apply Terraform** to create R2 bucket:
   ```bash
   cd infra/terraform/dev
   terraform apply
   ```

2. **Configure R2 Public Access**:
   - Go to Cloudflare Dashboard → R2 → Your Bucket
   - Enable public access
   - Configure CORS if needed

### Step 2: Upload Assets

1. **Set Environment Variables**:
   ```bash
   export R2_ACCOUNT_ID="your-account-id"
   export R2_ACCESS_KEY_ID="your-access-key"
   export R2_SECRET_ACCESS_KEY="your-secret-key"
   ```

2. **Run Migration Script**:
   ```bash
   cd apps/builder
   npm install  # Install @aws-sdk/client-s3
   npm run migrate-assets -- --env=dev --dry-run  # Test first
   npm run migrate-assets -- --env=dev  # Actual upload
   ```

3. **Verify Upload**:
   - Check R2 bucket in Cloudflare Dashboard
   - Verify manifest.json exists
   - Test CDN URL access

### Step 3: Configure Application

1. **Update Builder Environment**:
   ```bash
   cd apps/builder
   cp env.example .env
   # Edit .env and set VITE_PUBLIC_ASSETS_CDN_URL
   ```

2. **Update API Configuration**:
   - Edit `apps/api-go/config/dev.yaml`
   - Set `public_assets.r2_bucket` and `public_assets.cdn_base_url`

3. **Rebuild Application**:
   ```bash
   cd apps/builder
   npm run build
   ```

### Step 4: Verify

1. **Test Builder Preview**:
   - Open builder app
   - Select a layout
   - Verify images load from CDN (check Network tab)
   - Verify offline access works (disable network, reload)

2. **Test Published Site**:
   - Publish an invitation
   - Verify default assets are served from CDN
   - Check that user-uploaded assets still work

## Usage

### For Developers

#### Adding New Default Assets

1. **Add Files Locally**:
   - Place files in `apps/builder/public/assets/` or `apps/builder/public/layouts/`
   - Follow existing directory structure

2. **Upload to R2**:
   ```bash
   npm run migrate-assets -- --env=dev
   ```

3. **Update Code**:
   - Use `getDefaultAssetUrl()` or `getLayoutAssetUrl()` in your code
   - No need to change paths if using the service functions

#### Updating Existing Assets

1. **Replace Files Locally**
2. **Re-run Migration Script** (will overwrite existing files)
3. **Clear Browser Cache** (or wait for cache expiry)

### For Users

**No Action Required**: The optimization is transparent to end users. Assets automatically load from CDN with improved performance.

## Troubleshooting

### Assets Not Loading from CDN

1. **Check Environment Variable**:
   ```bash
   echo $VITE_PUBLIC_ASSETS_CDN_URL
   ```
   Should be set in `.env` file

2. **Verify R2 Bucket**:
   - Check bucket exists in Cloudflare Dashboard
   - Verify public access is enabled
   - Check assets are uploaded (manifest.json exists)

3. **Check CDN URL**:
   - Test CDN URL directly in browser
   - Verify CORS headers if loading from different domain

### Fallback to Local Assets

If CDN is not configured, the system automatically falls back to local assets:
- `getDefaultAssetUrl()` returns local paths
- Assets load from `/assets/` directory
- No errors, graceful degradation

### Cache Issues

1. **Clear Service Worker Cache**:
   - Open DevTools → Application → Service Workers
   - Click "Unregister"
   - Reload page

2. **Clear Browser Cache**:
   - Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
   - Or clear cache in browser settings

3. **Check Cache Headers**:
   - Verify R2 objects have correct `CacheControl` headers
   - Check Service Worker cache strategy

## Future Enhancements

1. **Asset Versioning**: Add version numbers to asset URLs for cache busting
2. **Image Optimization**: Automatic image optimization (WebP, responsive sizes)
3. **Progressive Loading**: Implement progressive image loading with blur-up
4. **Analytics**: Track asset load times and cache hit rates
5. **A/B Testing**: Test different CDN configurations for performance

## Related Documentation

- [Publishing Process](./publishing.md): How published sites handle assets
- [Cloudflare Setup](./cloudflare-setup.md): Cloudflare infrastructure setup
- [Deployment Guide](./DEPLOYMENT.md): Deployment procedures

## Summary

The build optimization initiative successfully:

✅ **Reduced initial bundle size** by moving default assets to R2  
✅ **Improved performance** through CDN delivery and lazy loading  
✅ **Enhanced scalability** with shared asset storage  
✅ **Better offline support** via PWA caching strategies  
✅ **Maintained backward compatibility** with local asset fallback  

The implementation is production-ready and provides a solid foundation for future optimizations.

