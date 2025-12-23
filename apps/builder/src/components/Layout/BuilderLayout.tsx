import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import BuilderSidebar from '../BuilderSidebar/BuilderSidebar';
import PreviewPane from '../Preview/PreviewPane';
import { useBuilderStore } from '../../store/builderStore';
import { useInvitationQuery } from '../../hooks/queries/useInvitations';
import { useLayoutManifestQuery } from '../../hooks/queries/useLayouts';
import type { Invitation } from '../../services/invitationService';
import './BuilderLayout.css';

type DeviceMode = 'desktop' | 'tablet' | 'mobile';

function BuilderLayout(): JSX.Element {
  const { invitationId } = useParams<{ invitationId: string }>();
  const navigate = useNavigate();
  const { setCurrentInvitation, loadLayoutManifest } = useBuilderStore();
  const [editMode, setEditMode] = useState(true);
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('desktop');

  // Query hooks
  const {
    data: invitation,
    isLoading: invitationLoading,
    error: invitationError,
  } = useInvitationQuery(invitationId, Boolean(invitationId));

  const {
    data: layoutManifest,
    isLoading: manifestLoading,
  } = useLayoutManifestQuery(invitation?.layoutId, Boolean(invitation?.layoutId));

  const loading = invitationLoading || manifestLoading;
  const error = invitationError ? 'Failed to load invitation' : null;

  useEffect(() => {
    if (!invitationId) {
      // No invitation ID, redirect to dashboard
      navigate('/dashboard');
      return;
    }
  }, [invitationId, navigate]);

  useEffect(() => {
    if (invitation) {
      setCurrentInvitation(invitation);
    }
  }, [invitation, setCurrentInvitation]);

  useEffect(() => {
    if (layoutManifest && invitation) {
      // Load layout manifest into store if needed
      loadLayoutManifest();
    }
  }, [layoutManifest, invitation, loadLayoutManifest]);

  useEffect(() => {
    if (error && invitationId) {
      // Redirect to dashboard if invitation not found
      setTimeout(() => navigate('/dashboard'), 2000);
    }
  }, [error, invitationId, navigate]);

  if (loading) {
    return (
      <div className="builder-layout builder-loading">
        <div className="builder-loading-content">
          <div className="builder-loading-spinner">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="15" r="5"/>
              <circle cx="16" cy="15" r="5"/>
              <path d="M8 10a5 5 0 0 1 8 0"/>
            </svg>
          </div>
          <p>Loading your invitation...</p>
        </div>
        <style>{`
          .builder-loading {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #fef1f0 0%, #fffaf5 50%, #f5e6d3 100%);
          }
          .builder-loading-content {
            text-align: center;
          }
          .builder-loading-spinner {
            width: 4rem;
            height: 4rem;
            margin: 0 auto 1rem;
            animation: pulse 1.5s ease-in-out infinite;
          }
          .builder-loading-spinner svg {
            width: 100%;
            height: 100%;
            color: #e8b4b8;
          }
          @keyframes pulse {
            0%, 100% { transform: scale(1); opacity: 0.7; }
            50% { transform: scale(1.1); opacity: 1; }
          }
          .builder-loading p {
            color: #6b6b6b;
            font-family: 'Quicksand', sans-serif;
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="builder-layout builder-error">
        <div className="builder-error-content">
          <h2>Oops!</h2>
          <p>{error}</p>
          <p>Redirecting to dashboard...</p>
        </div>
        <style>{`
          .builder-error {
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            background: linear-gradient(135deg, #fef1f0 0%, #fffaf5 50%, #f5e6d3 100%);
          }
          .builder-error-content {
            text-align: center;
            font-family: 'Quicksand', sans-serif;
          }
          .builder-error h2 {
            color: #8b2942;
            margin-bottom: 0.5rem;
          }
          .builder-error p {
            color: #6b6b6b;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="builder-layout">
      <BuilderSidebar
        editMode={editMode}
        onEditModeToggle={() => setEditMode(!editMode)}
        deviceMode={deviceMode}
        onDeviceModeChange={setDeviceMode}
      />
      <div className="builder-main">
        <PreviewPane 
          editMode={editMode}
          deviceMode={deviceMode}
        />
      </div>
    </div>
  );
}

export default BuilderLayout;

