/**
 * Editorial Elegance Layout Entry Point
 * Registers the layout with the central layout registry
 */

import { registerLayout } from '../registry.js';
import { editorialEleganceManifest } from './manifest.js';
import * as components from './components/index.js';
import * as styles from './styles/index.js';
import * as hooks from './hooks/index.js';
import * as exportModule from './export/index.js';

// Register editorial-elegance layout
registerLayout({
  id: 'editorial-elegance',
  name: 'Editorial Elegance',
  version: '1.0.0',
  manifest: editorialEleganceManifest,
  components,
  styles,
  hooks,
  export: exportModule,
});

console.log('✓ Registered layout: editorial-elegance (v1.0.0)');

