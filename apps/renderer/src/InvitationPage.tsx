/**
 * Invitation Page Component
 *
 * Renders the invitation using the same React components as the builder preview.
 * This ensures 100% consistency between preview and published site.
 */

import React from "react";
import type { InvitationData } from "@shared/types/wedding-data";
import {
  getLayout,
  getViewComponents,
  getSharedComponents,
  getLayoutManifest,
} from "@shared/layouts";
import { parseInvitationData } from "@shared/layouts/editorial-elegance/utils/dataHelpers";
// Import layouts to ensure they're registered
import "@shared/layouts/classic-scroll";
import "@shared/layouts/editorial-elegance";

interface InvitationPageProps {
  invitation: InvitationData;
  translations?: Record<string, unknown>;
}

export function InvitationPage({ invitation, translations = {} }: InvitationPageProps) {
  const layoutId = invitation.layoutId || "classic-scroll";
  const layout = getLayout(layoutId);

  if (!layout) {
    throw new Error(`Layout "${layoutId}" not found`);
  }

  const viewComponents = getViewComponents(layoutId);
  const sharedComponents = getSharedComponents(layoutId);

  // Parse invitation data - it should already be an object, but parseInvitationData handles edge cases
  const invitationData = parseInvitationData(invitation.data, invitation.data || {});

  // Get enabled sections from layoutConfig, sorted by order
  // Match builder's getEnabledSections logic exactly for consistency
  const manifest = getLayoutManifest(layoutId);
  let sections = invitation.layoutConfig?.sections || [];

  // Filter by manifest if available (same as builder)
  if (manifest?.sections && Array.isArray(manifest.sections)) {
    const manifestSectionIds = new Set(manifest.sections.map((s) => s.id));
    sections = sections.filter((s) => manifestSectionIds.has(s.id));
  }

  // Filter to only enabled sections
  // Match builder's exact logic: sections.filter((s) => s.enabled) - uses truthy check
  let enabledSections = sections
    .filter((s) => s.enabled) // Truthy check, same as builder
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  // Only fallback to manifest defaults if sections haven't been configured yet
  // This matches the builder's logic: only fallback if enabledSections.length === 0 && !hasConfiguredSections
  const hasConfiguredSections =
    invitation.layoutConfig?.sections && invitation.layoutConfig.sections.length > 0;

  if (enabledSections.length === 0 && !hasConfiguredSections) {
    // No sections configured at all - use manifest defaults (first time loading layout)
    if (manifest?.sections && Array.isArray(manifest.sections)) {
      enabledSections = manifest.sections
        .filter((s) => s.enabled !== false) // Match builder's manifest filter
        .map((s, index) => ({
          id: s.id,
          enabled: true,
          order: s.order !== undefined ? s.order : index,
        }))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    }
  }

  // Common props for view sections - match the structure expected by view components
  const viewProps = {
    translations,
    currentLang: "en", // Default language for published sites
    config: {
      ...invitationData,
      couple: invitationData.couple || invitation.data?.couple,
      wedding: invitationData.wedding || invitation.data?.wedding,
      hero: invitationData.hero || invitation.data?.hero,
      // Include customTranslations if present in data
      customTranslations: invitationData.customTranslations || invitation.data?.customTranslations,
    },
  };

  // Get shared components
  const Header = sharedComponents.Header || viewComponents.header;
  const Footer = viewComponents.footer;
  const Blessings = sharedComponents.Blessings;
  const ScrollAnimationsInit = sharedComponents.ScrollAnimationsInit;

  // Render a single section
  const renderSection = (sectionConfig: { id: string }) => {
    const { id } = sectionConfig;

    // Skip header and footer - they're rendered separately
    if (id === "header" || id === "footer") {
      return null;
    }

    const Component = viewComponents[id];

    if (!Component) {
      // Section component not found - skip it
      return null;
    }

    return <Component key={id} {...viewProps} />;
  };

  // Get sections without header/footer for main content
  const mainSections = enabledSections.filter((s) => s.id !== "header" && s.id !== "footer");

  // Check if footer is enabled
  const isFooterEnabled = enabledSections.some((s) => s.id === "footer");

  return (
    <>
      {Header && <Header {...viewProps} />}
      {Blessings && <Blessings />}
      {ScrollAnimationsInit && actualLayoutId === "editorial-elegance" && <ScrollAnimationsInit />}

      <main
        className={`page-shell ${actualLayoutId === "editorial-elegance" ? "editorial-elegance" : ""}`}
      >
        {mainSections.map((section) => renderSection(section))}

        {isFooterEnabled && Footer && <Footer {...viewProps} />}
      </main>
    </>
  );
}
