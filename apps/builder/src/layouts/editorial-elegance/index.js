/**
 * Editorial Elegance Layout Entry Point
 * Registers the layout with the central layout registry
 */

import { registerLayout } from '../registry';
import { editorialEleganceManifest } from './manifest';
import * as components from './components';
import * as styles from './styles';
import * as hooks from './hooks';
import * as exportModule from './export';

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

