# Dashboard Navigation Flow

*Note: This flow is inferred based on the application structure and redirects observed. Direct exploration of authenticated flows requires a valid user account.*

**Expected URL:** `/dashboard` or `/`

## Expected Features

### Invitation List
- **Display Options:**
  - Grid view of invitations
  - List view of invitations
  - Sortable by date, name, status

- **Invitation Cards:**
  - Preview thumbnail
  - Invitation name/title
  - Status indicator (draft, published, archived)
  - Last modified date
  - Creation date
  - Action buttons (edit, delete, share, publish)

### Navigation
- **User Profile:**
  - User profile/settings access
  - Account information
  - Subscription status (if applicable)

- **Logout Option:**
  - Sign out functionality
  - Session termination

- **Create New Invitation:**
  - Prominent "Create New" button
  - Quick access to layout selection
  - New invitation wizard

### Quick Actions
- **Create New Invitation:**
  - Start new invitation
  - Browse layouts
  - Quick create from template

- **Browse Layouts:**
  - Access to layout gallery
  - Search and filter layouts
  - Preview layouts

- **View Published Invitations:**
  - Filter by published status
  - View live invitations
  - Access sharing options

- **Manage Account Settings:**
  - Profile settings
  - Account preferences
  - Billing/subscription (if applicable)
  - Notification settings

## User Flow

1. User signs in successfully
2. User is redirected to dashboard
3. Dashboard loads user's invitations:
   - If new user: Shows empty state with "Create Your First Invitation" CTA
   - If existing user: Shows grid/list of invitations
4. User can perform actions:
   - Click "Create New" to start a new invitation
   - Click on existing invitation to edit
   - Delete invitations (with confirmation)
   - Share/publish invitations
   - Access account settings
   - Sign out

## Dashboard Layout (Expected)

### Header
- Logo/Brand name
- User profile menu
- Notification icon (if applicable)
- Settings icon
- Logout option

### Main Content Area
- **Empty State (New Users):**
  - Welcome message
  - "Create Your First Invitation" button
  - Quick start guide
  - Layout browsing option

- **Invitation Grid/List (Existing Users):**
  - Invitation cards
  - Filter and sort options
  - Search functionality
  - Pagination (if many invitations)

### Sidebar (If Applicable)
- Quick stats
- Recent activity
- Quick actions
- Help/resources

### Footer
- Links to help center
- Support contact
- Legal links

## Invitation Card Details

Each invitation card likely shows:
- **Thumbnail:** Preview image of the invitation
- **Title:** Invitation name
- **Status Badge:** Draft, Published, Archived
- **Metadata:**
  - Created date
  - Last modified date
  - Number of views (if published)
- **Actions:**
  - Edit button
  - Share button
  - Delete button
  - More options menu

## Filtering and Sorting

- **Filter Options:**
  - All invitations
  - Drafts only
  - Published only
  - Archived only

- **Sort Options:**
  - Recently modified
  - Recently created
  - Alphabetical
  - Status

## Empty State

For new users, the dashboard likely shows:
- Welcome message
- "Create Your First Invitation" prominent CTA
- Quick start tips
- Link to browse layouts
- Example invitations or templates

## Integration Points

- **Invitation Editor:** Clicking invitation opens editor
- **Layout Selection:** "Create New" opens layout browser
- **Account Settings:** Profile/settings access
- **Sharing:** Share published invitations
- **Analytics:** View invitation statistics (if available)

## Notes

- Dashboard is the central hub for authenticated users
- All user invitations are accessible from dashboard
- Quick actions provide easy access to common tasks
- Empty state guides new users
- Invitation management is the primary function

