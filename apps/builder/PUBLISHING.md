# Publishing & Deployment Guide

## Publishing Workflow

After editing your wedding invitation in the builder, here's how to publish it:

## Step 1: Save Your Invitation

1. **Auto-save**: Your changes are automatically saved as you edit
2. **Manual Save**: Click "Save" button (if available) to ensure all changes are saved
3. **Verify**: Check that all content, images, and settings are correct in the preview

## Step 2: Export Your Invitation

### Option A: Export as Static Site (Recommended)

1. **Click "Publish" or "Export" button** in the builder header
2. **Choose export format**:
   - **Static HTML Site** - Complete website ready to deploy
   - **ZIP Archive** - Downloadable package with all files
   - **PDF Document** - Printable version (future feature)

3. **Download the export** - You'll get a ZIP file containing:
   - `index.html` - Main invitation page
   - `styles.css` - All styles
   - `app.js` - JavaScript functionality
   - `assets/` - All images and media files
   - `manifest.json` - PWA configuration

### Option B: Deploy Directly (Future Feature)

1. **Click "Deploy" button**
2. **Choose hosting platform**:
   - Vercel (recommended)
   - Netlify
   - GitHub Pages
   - Custom domain

3. **One-click deployment** - Your invitation goes live instantly

## Step 3: Deploy to Hosting

### Option 1: Vercel (Easiest)

1. **Sign up** at [vercel.com](https://vercel.com)
2. **Import your project** or drag & drop the exported folder
3. **Deploy** - Your site is live in seconds
4. **Get a URL** like: `your-invitation.vercel.app`

### Option 2: Netlify

1. **Sign up** at [netlify.com](https://netlify.com)
2. **Drag & drop** the exported folder to Netlify
3. **Get instant URL** like: `your-invitation.netlify.app`

### Option 3: GitHub Pages

1. **Create a GitHub repository**
2. **Upload** exported files
3. **Enable GitHub Pages** in repository settings
4. **Access** at: `username.github.io/repository-name`

### Option 4: Custom Hosting

1. **Upload files** via FTP/SFTP to your web server
2. **Ensure** your server supports static files
3. **Configure** domain name if needed

### Option 5: CDN (Cloudflare, AWS S3, etc.)

1. **Upload** to CDN bucket
2. **Enable** static website hosting
3. **Configure** custom domain
4. **Get** fast, global distribution

## Step 4: Share Your Invitation

Once published, you can:

1. **Share the URL** with guests via:
   - WhatsApp
   - Email
   - Social media
   - SMS

2. **QR Code** (future feature):
   - Generate QR code for easy access
   - Print on physical invitations

3. **Custom Domain** (optional):
   - Connect your own domain (e.g., `priya-saurabh-wedding.com`)
   - More professional and memorable

## Publishing Checklist

Before publishing, verify:

- [ ] All text is correct (names, dates, venue)
- [ ] All images are uploaded and displaying
- [ ] RSVP contacts are correct
- [ ] Event schedule is accurate
- [ ] Venue details are correct
- [ ] Translations are complete (if using multiple languages)
- [ ] Preview looks good on mobile, tablet, and desktop
- [ ] All links work correctly
- [ ] Music/audio is working (if enabled)

## Post-Publishing

### Monitor & Manage

1. **View Analytics**:
   - Track how many people viewed your invitation
   - See RSVP responses
   - Monitor engagement

2. **Update Content**:
   - Make changes in the builder
   - Re-export and redeploy
   - Or use live update feature (future)

3. **Manage RSVPs**:
   - View all RSVP responses
   - Export guest list
   - Send reminders

## Current Status

### ✅ Available Now
- Export as static HTML site
- Download as ZIP file
- Manual deployment to hosting

### 🚧 Coming Soon
- One-click deployment to Vercel/Netlify
- Live preview URL (shareable link)
- Automatic updates (no re-deployment needed)
- QR code generation
- Custom domain setup
- PDF export
- Email invitations

## Quick Start

**Fastest way to publish:**

1. Edit your invitation in the builder
2. Click "Export" → Choose "Static HTML Site"
3. Download the ZIP file
4. Go to [vercel.com](https://vercel.com) → Drag & drop the folder
5. Share the URL with your guests!

**Total time: ~5 minutes** ⚡

## Support

If you need help with publishing:
- Check the [README-BUILDER.md](./README-BUILDER.md) for detailed setup
- Review export options in the builder UI
- Contact support (if available)

