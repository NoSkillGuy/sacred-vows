import { http, HttpResponse } from 'msw';

const API_BASE_URL = 'http://localhost:3000/api';

// Mock data
const mockUser = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
};

const mockAccessToken = 'mock-access-token-123';

const mockInvitations = [
  {
    id: 'inv-1',
    userId: '1',
    layoutId: 'classic-scroll',
    data: {
      couple: {
        bride: { name: 'Sarah' },
        groom: { name: 'John' },
      },
      wedding: {
        date: '2025-12-15',
        venue: { name: 'Grand Hotel' },
      },
    },
    layoutConfig: {
      sections: [],
      theme: {
        preset: 'default',
        colors: {},
        fonts: {},
      },
    },
    status: 'draft',
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'inv-2',
    userId: '1',
    layoutId: 'editorial-elegance',
    data: {
      couple: {
        bride: { name: 'Emma' },
        groom: { name: 'David' },
      },
      wedding: {
        date: '2025-06-20',
        venue: { name: 'Beach Resort' },
      },
    },
    layoutConfig: {
      sections: [],
      theme: {
        preset: 'default',
        colors: {},
        fonts: {},
      },
    },
    status: 'published',
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
];

const mockLayoutManifests = [
  {
    id: 'classic-scroll',
    name: 'Classic Scroll',
    description: 'A timeless classic design',
    metadata: {
      tags: ['classic', 'elegant'],
      isFeatured: true,
    },
    sections: [
      { id: 'hero', name: 'Hero', required: true },
      { id: 'couple', name: 'Couple', required: true },
    ],
    themes: [
      {
        id: 'default',
        name: 'Default',
        isDefault: true,
        colors: { primary: '#000000', secondary: '#ffffff' },
        fonts: { heading: 'serif', body: 'sans-serif' },
      },
    ],
  },
  {
    id: 'editorial-elegance',
    name: 'Editorial Elegance',
    description: 'Modern editorial style',
    metadata: {
      tags: ['modern', 'editorial'],
      isFeatured: true,
    },
    sections: [
      { id: 'hero', name: 'Hero', required: true },
      { id: 'couple', name: 'Couple', required: true },
      { id: 'story', name: 'Our Story', required: false },
    ],
    themes: [
      {
        id: 'default',
        name: 'Default',
        isDefault: true,
        colors: { primary: '#1a1a1a', secondary: '#f5f5f5' },
        fonts: { heading: 'sans-serif', body: 'serif' },
      },
    ],
  },
];

const mockAssets = [
  {
    id: 'asset-1',
    url: '/uploads/test-image-1.jpg',
  },
  {
    id: 'asset-2',
    url: '/uploads/test-image-2.jpg',
  },
];

// Auth handlers
export const handlers = [
  // Register
  http.post(`${API_BASE_URL}/auth/register`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string; name?: string };
    
    if (body.email === 'existing@example.com') {
      return HttpResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      accessToken: mockAccessToken,
      user: {
        ...mockUser,
        email: body.email,
        name: body.name || mockUser.name,
      },
    });
  }),

  // Login
  http.post(`${API_BASE_URL}/auth/login`, async ({ request }) => {
    const body = await request.json() as { email: string; password: string };
    
    if (body.email === 'wrong@example.com' || body.password === 'wrong') {
      return HttpResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    return HttpResponse.json({
      accessToken: mockAccessToken,
      user: {
        ...mockUser,
        email: body.email,
      },
    });
  }),

  // Logout
  http.post(`${API_BASE_URL}/auth/logout`, () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // Refresh token
  http.post(`${API_BASE_URL}/auth/refresh`, () => {
    return HttpResponse.json({
      accessToken: `refreshed-${mockAccessToken}`,
    });
  }),

  // Get current user
  http.get(`${API_BASE_URL}/auth/me`, () => {
    return HttpResponse.json({
      user: mockUser,
    });
  }),

  // Forgot password
  http.post(`${API_BASE_URL}/auth/forgot-password`, async ({ request }) => {
    const body = await request.json() as { email: string };
    
    if (body.email === 'notfound@example.com') {
      return HttpResponse.json(
        { error: 'Email not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: 'Password reset email sent',
    });
  }),

  // Reset password
  http.post(`${API_BASE_URL}/auth/reset-password`, async ({ request }) => {
    const body = await request.json() as { token: string; password: string };
    
    if (body.token === 'invalid-token') {
      return HttpResponse.json(
        { error: 'Invalid or expired token' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      message: 'Password reset successfully',
    });
  }),

  // Get all invitations
  http.get(`${API_BASE_URL}/invitations`, () => {
    return HttpResponse.json({
      invitations: mockInvitations,
    });
  }),

  // Get single invitation
  http.get(`${API_BASE_URL}/invitations/:id`, ({ params }) => {
    const { id } = params;
    const invitation = mockInvitations.find(inv => inv.id === id);
    
    if (!invitation) {
      return HttpResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      invitation,
    });
  }),

  // Create invitation
  http.post(`${API_BASE_URL}/invitations`, async ({ request }) => {
    const body = await request.json() as Partial<typeof mockInvitations[0]>;
    
    const newInvitation = {
      id: `inv-${Date.now()}`,
      userId: '1',
      layoutId: body.layoutId || 'classic-scroll',
      data: body.data || mockInvitations[0].data,
      layoutConfig: body.layoutConfig || mockInvitations[0].layoutConfig,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      invitation: newInvitation,
    });
  }),

  // Update invitation
  http.put(`${API_BASE_URL}/invitations/:id`, async ({ params, request }) => {
    const { id } = params;
    const body = await request.json() as Partial<typeof mockInvitations[0]>;
    
    const invitation = mockInvitations.find(inv => inv.id === id);
    
    if (!invitation) {
      return HttpResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    const updatedInvitation = {
      ...invitation,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return HttpResponse.json({
      invitation: updatedInvitation,
    });
  }),

  // Delete invitation
  http.delete(`${API_BASE_URL}/invitations/:id`, ({ params }) => {
    const { id } = params;
    const invitation = mockInvitations.find(inv => inv.id === id);
    
    if (!invitation) {
      return HttpResponse.json(
        { error: 'Invitation not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: 'Invitation deleted',
    });
  }),

  // Get all layout manifests
  http.get(`${API_BASE_URL}/layouts/manifests`, () => {
    return HttpResponse.json({
      manifests: mockLayoutManifests,
    });
  }),

  // Get single layout
  http.get(`${API_BASE_URL}/layouts/:id`, ({ params }) => {
    const { id } = params;
    const layout = mockLayoutManifests.find(l => l.id === id);
    
    if (!layout) {
      return HttpResponse.json(
        { error: 'Layout not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      layout,
    });
  }),

  // Get layout manifest
  http.get(`${API_BASE_URL}/layouts/:id/manifest`, ({ params }) => {
    const { id } = params;
    const manifest = mockLayoutManifests.find(l => l.id === id);
    
    if (!manifest) {
      return HttpResponse.json(
        { error: 'Layout manifest not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      manifest,
    });
  }),

  // Upload asset
  http.post(`${API_BASE_URL}/assets/upload`, async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      url: `/uploads/${file.name}`,
      asset: {
        id: `asset-${Date.now()}`,
        url: `/uploads/${file.name}`,
      },
    });
  }),

  // Get all assets
  http.get(`${API_BASE_URL}/assets`, () => {
    return HttpResponse.json({
      assets: mockAssets,
    });
  }),

  // Get asset count
  http.get(`${API_BASE_URL}/assets/count`, () => {
    return HttpResponse.json({
      count: mockAssets.length,
    });
  }),

  // Delete asset
  http.delete(`${API_BASE_URL}/assets/:id`, ({ params }) => {
    const { id } = params;
    const asset = mockAssets.find(a => a.id === id);
    
    if (!asset) {
      return HttpResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      message: 'Asset deleted',
    });
  }),
];

