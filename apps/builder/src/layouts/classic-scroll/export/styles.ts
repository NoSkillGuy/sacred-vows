/**
 * Classic Scroll Layout Export Styles
 *
 * Generates CSS for exporting the classic-scroll layout.
 * This ensures styles in the export match the builder preview.
 */

import type { InvitationData } from "@shared/types/wedding-data";

/**
 * Generate CSS for the invitation export
 * @param invitation - Invitation data with layoutConfig
 * @returns Promise with CSS content
 */
export async function generateCSS(invitation: InvitationData): Promise<string> {
  const { layoutConfig, data } = invitation;
  const theme = layoutConfig?.theme || data?.theme || {};
  const colors = theme.colors || {};
  const fonts = theme.fonts || {};

  // Full CSS from main.css with theme variable injection
  const css = `
:root {
  --bg-page: ${colors.background?.page || colors.background || "#fff8f0"};
  --bg-card: ${colors.background?.card || colors.background?.section || "#fff7ee"};
  --bg-card-deep: #fbead9;
  --border-gold: ${colors.primary || "#d4af37"};
  --border-soft: #ecd8b6;
  --accent-gold: ${colors.primary || "#d4af37"};
  --accent-gold-soft: #f5d48a;
  --accent-rose: ${colors.accent || "#c27d88"};
  --accent-blush: #f6c1c7;
  --accent-sage: #9bb69d;
  --accent-gold-rgb: 212, 175, 55;
  --accent-blush-rgb: 246, 193, 199;
  --accent-sage-rgb: 155, 182, 157;
  --primary-rgb: 124, 40, 49;
  --button-primary-rgb: 124, 40, 49;
  --text-main: ${colors.text?.primary || colors.text || "#2f2933"};
  --text-muted: ${colors.text?.muted || colors.text || "#6c5b5b"};
  --button-primary: ${colors.primary || "#7c2831"};
  --button-primary-hover: #651f27;
  --shadow-soft: 0 20px 40px rgba(0, 0, 0, 0.07);
  --radius-large: 24px;
  --radius-medium: 18px;
  --page-width: 1080px;
  --section-spacing: 70px;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "${fonts.body || "Poppins"}", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background:
    radial-gradient(circle at top left, rgba(var(--accent-blush-rgb), 0.35), transparent 60%),
    radial-gradient(circle at bottom right, rgba(var(--accent-sage-rgb), 0.35), transparent 60%),
    var(--bg-page);
  color: var(--text-main);
  -webkit-font-smoothing: antialiased;
  line-height: 1.6;
}

img {
  max-width: 100%;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

html {
  scroll-behavior: smooth;
}

.page-shell {
  max-width: var(--page-width);
  margin: 0 auto;
  padding: 0px 16px 16px 16px;
}

/* Mobile-first responsive adjustments */
@media (max-width: 480px) {
  :root {
    --section-spacing: 50px;
  }

  .page-shell {
    padding: 12px 12px 60px;
  }

  header.site-header {
    margin: 0;
    padding: 8px 12px 6px;
    width: 100%;
  }

  .brand-monogram {
    width: 32px;
    height: 32px;
  }

  .brand-title {
    font-size: 11px;
  }

  .brand-sub {
    font-size: 9px;
  }

  .music-toggle {
    font-size: 10px;
    padding: 3px 8px;
  }

  .hero {
    margin-top: 10px;
    padding: 20px 14px 24px;
    border-radius: 24px;
  }

  .hero-eyebrow {
    font-size: 9px;
    margin-bottom: 6px;
  }

  .hero-script {
    font-size: 20px;
    margin-bottom: 3px;
  }

  .hero-names {
    font-size: clamp(24px, 8vw, 32px);
    margin-bottom: 6px;
  }

  .hero-amp {
    font-size: 22px;
    margin: 0 6px;
  }

  .hero-sub {
    font-size: 11px;
    margin-bottom: 14px;
  }

  .hero-date {
    font-size: 12px;
    margin-bottom: 3px;
  }

  .hero-location {
    font-size: 11px;
    margin-bottom: 12px;
  }

  .hero-divider {
    width: 100px;
    margin-bottom: 14px;
  }

  .hero-countdown {
    padding: 6px 10px;
    margin-bottom: 14px;
  }

  .hero-count-label {
    font-size: 10px;
  }

  .hero-countdown-values {
    font-size: 10px;
    gap: 6px;
  }

  .hero-actions {
    flex-direction: column;
    gap: 8px;
  }

  .btn {
    width: 100%;
    justify-content: center;
    padding: 10px 16px;
    font-size: 10px;
  }

  .hero-photo-card {
    margin-top: 16px;
    padding: 12px 12px 14px;
  }

  .section-header {
    margin-bottom: 18px;
  }

  .section-eyebrow {
    font-size: 9px;
    margin-bottom: 3px;
  }

  .section-title {
    font-size: 18px;
    margin-bottom: 3px;
  }

  .section-subtitle {
    font-size: 12px;
  }

  .card {
    padding: 16px 14px 18px;
    border-radius: 20px;
  }

  .couple-grid {
    gap: 16px;
  }

  .headline {
    font-size: 14px;
    margin-bottom: 6px;
  }

  .muted {
    font-size: 12px;
  }

  .person-block {
    margin-top: 8px;
    margin-bottom: 8px;
  }

  .person-name {
    font-size: 13px;
  }

  .portrait-frame {
    max-width: 100%;
    margin-top: 10px;
  }

  .gallery-grid {
    gap: 10px;
  }

  .gallery-item {
    border-radius: 16px;
  }

  .event-day {
    padding: 12px 12px 14px;
    border-radius: 18px;
  }

  .event-date-main {
    font-size: 13px;
    margin-bottom: 12px;
  }

  .event-item {
    padding-left: 45px;
    min-height: 48px;
    padding-top: 6px;
    margin-top: 6px;
  }

  .event-icon-wrapper {
    width: 38px;
    height: 38px;
  }

  .event-icon-emoji {
    font-size: 20px;
  }

  .event-label {
    font-size: 11px;
  }

  .event-tag {
    font-size: 9px;
  }

  .event-time {
    font-size: 11px;
  }

  .venue-grid {
    gap: 14px;
  }

  .venue-address {
    font-size: 12px;
    margin-bottom: 8px;
  }

  .chip {
    font-size: 9px;
    padding: 3px 7px;
  }

  .map-embed {
    height: 200px;
  }

  .rsvp-grid {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  .rsvp-pill {
    font-size: 10px;
    padding: 5px 9px;
  }

  footer.site-footer {
    margin-top: 40px;
    padding-top: 16px;
    font-size: 10px;
  }

  .footer-main {
    font-size: 12px;
  }
}

@media (max-width: 360px) {
  .hero-names {
    font-size: 20px;
  }

  .hero-amp {
    font-size: 18px;
  }

  .brand-title {
    font-size: 10px;
  }

  .brand-sub {
    display: none;
  }
}

/* HEADER / NAV */
header.site-header {
  position: sticky;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: linear-gradient(to bottom, rgba(255, 248, 240, 0.98), rgba(255, 248, 240, 0.95));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(var(--accent-gold-rgb), 0.18);
  margin: 0;
  padding: 10px 16px 6px;
  width: 100%;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.nav-inner {
  max-width: var(--page-width);
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.nav-inner > div:last-child {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 0;
}

.brand-text {
  min-width: 0;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.brand-title,
.brand-sub {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.brand-monogram {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.9);
  object-fit: cover;
  box-shadow: 0 0 20px rgba(var(--accent-gold-rgb), 0.7);
}

.brand-title {
  font-size: 13px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.brand-sub {
  font-size: 10px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.nav-links {
  display: none;
  gap: 18px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
}

.nav-links a {
  position: relative;
  padding-bottom: 3px;
}

.nav-links a::after {
  content: "";
  position: absolute;
  left: 0;
  bottom: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, var(--border-gold), var(--accent-rose));
  transition: width 0.18s ease;
}

.nav-links a:hover::after {
  width: 100%;
}

.language-switcher {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.55);
  background: linear-gradient(135deg, #fff9f0, #fdf2f7);
  font-size: 16px;
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(var(--accent-gold-rgb), 0.15);
}

.language-switcher:hover {
  transform: scale(1.1);
  box-shadow: 0 6px 16px rgba(var(--accent-gold-rgb), 0.25);
  border-color: var(--border-gold);
}

.music-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border-radius: 999px;
  padding: 4px 10px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.55);
  background: linear-gradient(to right, #fff9f0, #fce7e7);
  font-size: 11px;
  cursor: pointer;
  user-select: none;
  box-shadow: 0 10px 18px rgba(var(--accent-gold-rgb), 0.18);
}

.music-dot {
  width: 9px;
  height: 9px;
  border-radius: 999px;
  background: #b91c1c;
  box-shadow: 0 0 10px rgba(185, 28, 28, 0.6);
  transition: background 0.18s ease, box-shadow 0.18s ease;
}

.music-dot.on {
  background: #16a34a;
  box-shadow: 0 0 12px rgba(22, 163, 74, 0.9);
}

@media (min-width: 840px) {
  header.site-header {
    margin: 0;
    padding: 10px 24px 6px;
    width: 100%;
  }
  .page-shell {
    padding-inline: 24px;
  }
  .nav-links {
    display: inline-flex;
  }
}

/* HERO */
.hero {
  margin-top: 14px;
  border-radius: 32px;
  padding: 26px 18px 30px;
  background:
    radial-gradient(circle at top left, rgba(var(--accent-blush-rgb), 0.35), transparent 55%),
    radial-gradient(circle at bottom right, rgba(var(--accent-sage-rgb), 0.4), transparent 55%),
    var(--bg-card, #fffaf4);
  border: 1px solid rgba(var(--accent-gold-rgb), 0.45);
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
}

.hero::before,
.hero::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(250, 250, 250, 0.9), transparent 70%);
  opacity: 0.9;
  pointer-events: none;
}

.hero::before {
  width: 480px;
  height: 480px;
  top: -240px;
  right: -140px;
}

.hero::after {
  width: 400px;
  height: 400px;
  bottom: -220px;
  left: -100px;
}

.hero-inner {
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr);
  gap: 22px;
  align-items: center;
}

@media (min-width: 900px) {
  .hero {
    padding: 32px 32px 36px;
  }
  .hero-inner {
    grid-template-columns: minmax(0, 1.25fr) minmax(0, 0.95fr);
  }
}

.hero-eyebrow {
  font-size: 10px;
  letter-spacing: 0.26em;
  text-transform: uppercase;
  color: var(--accent-rose);
  margin-bottom: 8px;
}

.hero-script {
  font-family: "${fonts.script || "Great Vibes"}", cursive;
  font-size: 24px;
  color: var(--accent-rose);
  margin-bottom: 4px;
}

.hero-names {
  font-family: "${fonts.heading || "Playfair Display"}", serif;
  font-size: clamp(30px, 6vw, 40px);
  letter-spacing: 0.16em;
  text-transform: uppercase;
  margin-bottom: 8px;
}

.hero-amp {
  font-family: "${fonts.script || "Great Vibes"}", cursive;
  font-size: 26px;
  margin: 0 8px;
  color: var(--accent-rose);
}

.hero-sub {
  font-size: 12px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 18px;
}

.hero-date {
  font-size: 13px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: var(--button-primary);
  margin-bottom: 4px;
}

.hero-location {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 16px;
}

.hero-divider {
  width: 120px;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--border-gold), transparent);
  margin-bottom: 18px;
}

.hero-countdown {
  display: inline-flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  border-radius: 999px;
  padding: 8px 12px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.6);
  background: linear-gradient(to right, var(--bg-card, #fff9f0), var(--accent-blush, #fdf2f7));
  margin-bottom: 18px;
}

.hero-count-label {
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--button-primary);
}

.hero-countdown-values {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}

.hero-countdown-values span {
  font-variant-numeric: tabular-nums;
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 999px;
  padding: 9px 18px;
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.18s ease;
  white-space: nowrap;
}

.btn-primary {
  background: linear-gradient(135deg, var(--button-primary), var(--button-primary-hover));
  color: #fff7ef;
  border-color: rgba(var(--button-primary-rgb), 0.8);
  box-shadow:
    0 16px 30px rgba(var(--button-primary-rgb), 0.35),
    0 0 10px rgba(var(--accent-gold-rgb), 0.25);
}

.btn-primary:hover {
  background: linear-gradient(135deg, var(--button-primary-hover), var(--button-primary));
  transform: translateY(-1px);
  box-shadow:
    0 18px 32px rgba(var(--button-primary-rgb), 0.45),
    0 0 14px rgba(var(--accent-gold-rgb), 0.35);
}

.btn-ghost {
  background: color-mix(in srgb, var(--bg-card, #fff7eb) 90%, transparent);
  border-color: rgba(var(--accent-gold-rgb), 0.7);
  color: var(--text-main);
}

.btn-ghost:hover {
  background: var(--bg-card, #fff7eb);
  transform: translateY(-1px);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.06);
}

.btn-icon {
  font-size: 14px;
}

.hero-photo-card {
  border-radius: 26px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.6);
  background:
    radial-gradient(circle at top, rgba(var(--accent-blush-rgb), 0.35), transparent 65%),
    var(--bg-card, #fff9f2);
  padding: 14px 14px 16px;
  box-shadow: var(--shadow-soft);
  position: relative;
  overflow: hidden;
}

.hero-photo-frame {
  border-radius: 22px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.9);
  padding: 5px;
  background: linear-gradient(
    145deg,
    var(--bg-page, #fdfaf4),
    color-mix(in srgb, var(--accent-gold) 22%, var(--bg-card, #f8e6d1))
  );
  margin-bottom: 10px;
}

.hero-photo-inner {
  border-radius: 18px;
  overflow: hidden;
  background: var(--accent-blush, #f3d6d6);
  aspect-ratio: 4 / 5;
  display: flex;
  align-items: stretch;
  justify-content: center;
  padding: 0;
  position: relative;
}

.hero-photo-caption {
  font-size: 11px;
  color: var(--text-muted);
  text-align: center;
}

.hero-photo-inner img,
.portrait-inner img,
.gallery-inner img {
  width: 100%;
  height: 100%;
  max-width: none;
  object-fit: cover;
  object-position: center;
  display: block;
}

.portrait-inner,
.gallery-inner {
  padding: 0;
  display: flex;
  align-items: stretch;
  justify-content: center;
  position: relative;
}

/* GENERAL SECTIONS */
section {
  margin-top: var(--section-spacing);
}

.section-header {
  margin-bottom: 22px;
  text-align: left;
}

.section-eyebrow {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.24em;
  color: var(--accent-rose);
  margin-bottom: 4px;
}

.section-title {
  font-family: "${fonts.heading || "Playfair Display"}", serif;
  font-size: 22px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.section-subtitle {
  font-size: 13px;
  color: var(--text-muted);
}

.card {
  border-radius: var(--radius-large);
  background: var(--bg-card);
  border: 1px solid var(--border-soft);
  box-shadow: var(--shadow-soft);
  padding: 18px 16px 20px;
  position: relative;
  overflow: hidden;
}

.card::before,
.card::after {
  content: "";
  position: absolute;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(var(--accent-blush-rgb), 0.16), transparent 70%);
  inset: auto auto 0 0;
  opacity: 0.8;
  pointer-events: none;
}

.card::after {
  inset: 0 -40px auto auto;
  background: radial-gradient(circle, rgba(var(--accent-sage-rgb), 0.2), transparent 70%);
}

.card-inner {
  position: relative;
}

@media (min-width: 880px) {
  .card {
    padding: 24px 24px 26px;
  }
}

/* COUPLE SECTION */
.couple-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
}

@media (max-width: 720px) {
  .couple-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.headline {
  font-family: "${fonts.heading || "Playfair Display"}", serif;
  font-size: 16px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  margin-bottom: 8px;
}

.muted {
  color: var(--text-muted);
  font-size: 13px;
}

.person-block {
  margin-top: 10px;
  margin-bottom: 10px;
}

.person-role {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.person-name {
  font-size: 14px;
  font-weight: 500;
}

.portrait-frame {
  margin-top: 12px;
  border-radius: 20px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.7);
  padding: 5px;
  background: linear-gradient(130deg, #fdf6ec, #f7e1cf);
  max-width: 260px;
}

.portrait-inner {
  border-radius: 16px;
  overflow: hidden;
  background: #f3d6d6;
  aspect-ratio: 3 / 4;
  display: block;
  padding: 0;
  position: relative;
  text-align: center;
  font-size: 11px;
  color: rgba(88, 44, 50, 0.9);
}

/* GALLERY SECTION */
.gallery-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

@media (min-width: 780px) {
  .gallery-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gallery-item {
  border-radius: var(--radius-medium);
  border: 1px solid rgba(var(--accent-gold-rgb), 0.6);
  padding: 5px;
  background: linear-gradient(135deg, #fdf7f0, #f7e0dd);
  overflow: hidden;
}

.gallery-inner {
  border-radius: 14px;
  overflow: hidden;
  background: #f4d9da;
  aspect-ratio: 4 / 3;
  display: block;
  padding: 0;
  font-size: 11px;
  text-align: center;
  color: rgba(88, 44, 50, 0.9);
}

.gallery-inner.tall {
  aspect-ratio: 3 / 4;
}

/* EVENTS SECTION */
.event-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 14px;
  margin-top: 4px;
}

@media (min-width: 720px) {
  .event-grid {
    grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  }
}

.event-day {
  position: relative;
  border-radius: 20px;
  padding: 18px 18px 20px;
  background: var(--bg-card-deep);
  border: 1px solid rgba(var(--accent-gold-rgb), 0.6);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.event-day:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.12);
}

.event-day::before {
  content: "";
  position: absolute;
  inset: -1px -1px auto auto;
  width: 52px;
  height: 18px;
  border-bottom-left-radius: 20px;
  border-top-right-radius: 20px;
  background: linear-gradient(135deg, var(--accent-blush), var(--accent-sage));
  opacity: 0.2;
}

.event-date-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  color: var(--accent-rose);
  margin-bottom: 2px;
}

.event-date-main {
  font-family: "${fonts.heading || "Playfair Display"}", serif;
  font-size: 15px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  margin-bottom: 14px;
  color: var(--text-main);
  position: relative;
  padding-bottom: 8px;
}

.event-date-main::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  width: 40px;
  height: 2px;
  background: linear-gradient(90deg, var(--accent-rose), var(--border-gold));
  border-radius: 2px;
}

.event-item {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 12px;
  border-top: 1px solid rgba(236, 216, 182, 0.9);
  padding-top: 8px;
  padding-left: 50px;
  margin-top: 8px;
  min-height: 50px;
}

.event-item:first-of-type {
  border-top: none;
  margin-top: 0;
  padding-top: 0;
}

.event-left {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.event-label {
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: var(--text-main);
}

.event-tag {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.14em;
  color: var(--text-muted);
}

.event-time {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--button-primary);
  white-space: nowrap;
}

.event-icon-wrapper {
  position: absolute;
  left: 0;
  top: 0;
  width: 42px;
  height: 42px;
  border-radius: 12px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.7);
  background: linear-gradient(135deg, #fff9f0, #fdf2f7);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(var(--accent-gold-rgb), 0.2);
}

.event-icon-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  border-radius: 11px;
  transition: transform 0.3s ease;
  padding: 4px;
}

.event-icon-emoji {
  font-size: 24px;
  line-height: 1;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
  display: block;
  position: relative;
  z-index: 1;
}

.event-content {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  gap: 10px;
  flex: 1;
}

/* VENUE SECTION */
.venue-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(0, 1.1fr);
  gap: 18px;
}

@media (max-width: 780px) {
  .venue-grid {
    grid-template-columns: minmax(0, 1fr);
  }
}

.venue-address {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 10px;
}

.chip-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}

.chip {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.16em;
  padding: 4px 8px;
  border-radius: 999px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.6);
  background: #fff8f0;
  color: var(--button-primary);
}

.map-card {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.7);
  background: #fdf7f0;
  box-shadow: var(--shadow-soft);
}

.map-embed {
  border: 0;
  width: 100%;
  height: 240px;
  display: block;
}

.map-footer {
  padding: 8px 10px 10px;
  font-size: 11px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  color: var(--text-muted);
}

.map-footer a {
  font-size: 11px;
  color: var(--button-primary);
}

.map-placeholder {
  width: 100%;
  height: 240px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--bg-card);
  color: var(--text-muted);
}

/* RSVP SECTION */
.rsvp-text {
  font-size: 13px;
  color: var(--text-muted);
  margin-bottom: 12px;
}

.rsvp-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-bottom: 16px;
}

.rsvp-pill {
  border-radius: 999px;
  padding: 6px 10px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.7);
  background: #fff9f2;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
}

.rsvp-badge {
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 1px solid rgba(var(--accent-gold-rgb), 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--button-primary);
  background: #fffaf2;
}

.small-note {
  font-size: 11px;
  color: var(--text-muted);
}

/* FOOTER */
footer.site-footer {
  margin-top: 50px;
  padding-top: 18px;
  border-top: 1px solid rgba(var(--accent-gold-rgb), 0.5);
  text-align: center;
  font-size: 11px;
  color: var(--text-muted);
}

.footer-main {
  font-family: "${fonts.heading || "Playfair Display"}", serif;
  font-size: 14px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  margin-bottom: 4px;
}

.footer-line {
  margin-bottom: 4px;
}

.footer-flowers {
  margin-top: 8px;
  font-size: 12px;
  color: var(--accent-rose);
}

.footer-mini {
  margin-top: 8px;
  font-size: 10px;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.relation-label {
  font-size: 11px;
  color: var(--text-muted);
}
`;

  return css;
}

export default generateCSS;
